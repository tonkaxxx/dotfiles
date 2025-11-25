import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
from sklearn.preprocessing import StandardScaler
import joblib

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# для дебага
def get_season(date):
    month = date.month
    day = date.day
    
    if 3 <= month <= 5: return 0  # Весна
    elif 6 <= month <= 8: return 1  # Лето
    elif 9 <= month <= 11: return 2  # Осень
    else: return 3  # Зима

def generate_weather_data(days):
    # создаем массив дат 365 с дневным шагом 
    dates = pd.date_range(start='2025-01-01', periods=days, freq='D')
    # создаем ндлист от 1 до кол-ва дней  
    time = np.arange(days)
    
    # более сложные сезонные паттерны
    base_temperature = 7.5 + 22.5 * np.sin(2 * np.pi * time / 365 - np.pi/2)
    
    # суб-сезонные колебания
    seasonal_modulation = 3 * np.sin(2 * np.pi * time / 30)
    
    temperature_num_points = days // 30
    temperature_random_points = np.random.normal(0, 2, temperature_num_points)
    temperature_random_days = np.linspace(0, days-1, temperature_num_points)
    temperature_smooth_noise = np.interp(time, temperature_random_days, temperature_random_points)
    
    daily_random_noise = np.array([np.round(np.random.uniform(-0.5, 0.5), 1) for i in range(days)])
    
    temperature = base_temperature + seasonal_modulation + temperature_smooth_noise 
    
    temp_series = pd.Series(temperature)
    temperature = temp_series.rolling(window=3, center=True, min_periods=1).mean().values + daily_random_noise

    # более сложная зависимость влажности
    base_humidity = 75 - 0.48 * temperature + 5 * np.sin(2 * np.pi * time / 365)
    
    humidity_num_points = days // 30
    humidity_random_points = np.random.normal(0, 4, humidity_num_points)
    humidity_random_days = np.linspace(0, days-1, humidity_num_points)
    humidity_smooth_noise = np.interp(time, humidity_random_days, humidity_random_points)
    
    humidity = base_humidity + humidity_smooth_noise + daily_random_noise * 1.5
    humidity = np.clip(humidity, 40, 95)
    
    # более сложное давление
    pressure = 1015 + 8 * np.sin(2 * np.pi * time / 365 + np.pi/4) + 2 * np.sin(2 * np.pi * time / 30)
    pressure += np.random.normal(0, 1, days)
    
    # ветер с сезонными изменениями
    base_wind = 2.5 + 1.5 * np.sin(2 * np.pi * time / 365) + 0.5 * np.sin(2 * np.pi * time / 7)
    wind_speed = np.clip(base_wind + np.random.normal(0, 0.8, days), 0.5, 8)
    
    seasons = [get_season(date) for date in dates]
    
    df = pd.DataFrame({
        'season': seasons,
        'date': dates,
        'temperature': np.round(temperature, 1),
        'humidity': np.round(humidity, 1),
        'pressure': np.round(pressure, 1),
        'wind_speed': np.round(wind_speed, 1)
    })
    
    return df

def create_additional_features(df):
    """Создание дополнительных признаков"""
    df = df.copy()
    
    # временные признаки
    df['day_of_year'] = df['date'].dt.dayofyear
    df['month'] = df['date'].dt.month
    df['day_sin'] = np.sin(2 * np.pi * df['day_of_year'] / 365)
    df['day_cos'] = np.cos(2 * np.pi * df['day_of_year'] / 365)
    
    # взаимодействия между признаками
    df['temp_humidity'] = df['temperature'] * df['humidity'] / 100
    df['pressure_trend'] = df['pressure'].diff().fillna(0)
    
    # скользящие средние
    df['temp_ma_3'] = df['temperature'].rolling(window=3, min_periods=1).mean()
    df['humidity_ma_3'] = df['humidity'].rolling(window=3, min_periods=1).mean()
    
    return df

# разделяем данные на значение и лейбл
def split_data(data, past_size=7, forecast_horizon=3):
    x, y = [], []
    
    # используем все числовые колонки кроме date
    numeric_cols = data.select_dtypes(include=[np.number]).columns.tolist()
    data_features = data[numeric_cols].values
    
    # проходим по всему датасету
    for i in range(len(data) - past_size - forecast_horizon + 1):
        # значения: последние past_size дней
        past = data_features[i:(i + past_size)]
        # лейбл: следующие forecast_horizon дней (только основные 4 параметра)
        future = data_features[i + past_size : i + past_size + forecast_horizon, :4]
        
        x.append(past)
        y.append(future)
    
    return np.array(x), np.array(y)

class ImprovedWeatherLSTM(nn.Module):
    def __init__(self, input_size, hidden_size=128, num_layers=3, output_size=12, dropout=0.3):
        super(ImprovedWeatherLSTM, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        # bidirectional LSTM
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, 
                           batch_first=True, dropout=dropout, bidirectional=True)
        
        # attention mechanism
        self.attention = nn.Sequential(
            nn.Linear(hidden_size * 2, 64),
            nn.Tanh(),
            nn.Linear(64, 1),
            nn.Softmax(dim=1)
        )
        
        # более глубокая полносвязная сеть
        self.fc = nn.Sequential(
            nn.Linear(hidden_size * 2, 128),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, output_size)
        )
        
        # layer normalization
        self.layer_norm = nn.LayerNorm(hidden_size * 2)
    
    def forward(self, x):
        # LSTM
        lstm_out, _ = self.lstm(x)
        lstm_out = self.layer_norm(lstm_out)
        
        # Attention
        attention_weights = self.attention(lstm_out)
        context_vector = torch.sum(attention_weights * lstm_out, dim=1)
        
        # Fully connected
        out = self.fc(context_vector)
        return out.view(-1, 3, 4)

# комбинированная функция потерь
class CombinedLoss(nn.Module):
    def __init__(self):
        super(CombinedLoss, self).__init__()
        self.mse = nn.MSELoss()
        self.mae = nn.L1Loss()
        self.huber = nn.SmoothL1Loss()
    
    def forward(self, pred, target):
        mse_loss = self.mse(pred, target)
        mae_loss = self.mae(pred, target)
        huber_loss = self.huber(pred, target)
        
        # комбинируем потери с разными весами
        return 0.6 * mse_loss + 0.3 * mae_loss + 0.1 * huber_loss

def predict_weather(model, last_days_data, scaler_x, scaler_y):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model.eval()
    
    last_days_scaled = scaler_x.transform(last_days_data.reshape(-1, last_days_data.shape[-1]))
    last_days_scaled = last_days_scaled.reshape(1, last_days_data.shape[0], last_days_data.shape[1])
    
    # юзаем torch.no_grad() чтобы не менялись веса
    with torch.no_grad():
        input_tensor = torch.FloatTensor(last_days_scaled).to(device)
        prediction = model(input_tensor)
    
    # обратно нормализуем
    prediction_np = prediction.cpu().numpy().reshape(-1, 4)
    prediction_original = scaler_y.inverse_transform(prediction_np).reshape(3, 4)
    
    return prediction_original

def load_trained_model(model_path='weather_model.pth'):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    # нужно знать input_size для создания модели
    scaler_x = joblib.load('scaler_x.pkl')
    input_size = scaler_x.n_features_in_
    
    model = ImprovedWeatherLSTM(input_size=input_size).to(device)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()
    return model

def save_model_and_scalers(model, scaler_x, scaler_y, model_path='weather_model.pth', 
                          scaler_x_path='scaler_x.pkl', scaler_y_path='scaler_y.pkl'):
    torch.save(model.state_dict(), model_path)
    joblib.dump(scaler_x, scaler_x_path)
    joblib.dump(scaler_y, scaler_y_path)

if __name__ == "__main__":
    np.set_printoptions(suppress=True, precision=2)
    
    # генерируем больше данных
    weather_df = generate_weather_data(365*8)  # 8 лет данных
    weather_df = create_additional_features(weather_df)
    
    print("Доступные колонки:", weather_df.columns.tolist())
    
    x, y = split_data(weather_df, past_size=7, forecast_horizon=3)

    # разделение на train/val/test
    train_size = int(0.7 * len(x))
    val_size = int(0.15 * len(x))
    
    x_train, x_val, x_test = x[:train_size], x[train_size:train_size+val_size], x[train_size+val_size:]
    y_train, y_val, y_test = y[:train_size], y[train_size:train_size+val_size], y[train_size+val_size:]

    # скейлеры для нормализации данных
    scaler_x = StandardScaler()
    scaler_y = StandardScaler()

    # решейпим массивы для нормализации
    x_train_reshaped = x_train.reshape(-1, x_train.shape[-1])
    x_val_reshaped = x_val.reshape(-1, x_val.shape[-1])
    x_test_reshaped = x_test.reshape(-1, x_test.shape[-1])
    
    y_train_reshaped = y_train.reshape(-1, y_train.shape[-1])
    y_val_reshaped = y_val.reshape(-1, y_val.shape[-1])
    y_test_reshaped = y_test.reshape(-1, y_test.shape[-1])

    # нормализируем данные
    x_train_scaled = scaler_x.fit_transform(x_train_reshaped).reshape(x_train.shape)
    x_val_scaled = scaler_x.transform(x_val_reshaped).reshape(x_val.shape)
    x_test_scaled = scaler_x.transform(x_test_reshaped).reshape(x_test.shape)
    
    y_train_scaled = scaler_y.fit_transform(y_train_reshaped).reshape(y_train.shape)
    y_val_scaled = scaler_y.transform(y_val_reshaped).reshape(y_val.shape)
    y_test_scaled = scaler_y.transform(y_test_reshaped).reshape(y_test.shape)

    # преобразовываем в тензоры 
    x_train_tensor = torch.FloatTensor(x_train_scaled)
    y_train_tensor = torch.FloatTensor(y_train_scaled)
    x_val_tensor = torch.FloatTensor(x_val_scaled)
    y_val_tensor = torch.FloatTensor(y_val_scaled)
    x_test_tensor = torch.FloatTensor(x_test_scaled)
    y_test_tensor = torch.FloatTensor(y_test_scaled)

    # создаем датасет и даталоадер
    train_dataset = TensorDataset(x_train_tensor, y_train_tensor)
    train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True, num_workers=2)

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    # автоматическое определение размера входа
    input_size = x_train.shape[-1]
    model = ImprovedWeatherLSTM(input_size=input_size).to(device)
    print(f"Model input size: {input_size}")
    print(model)

    criterion = CombinedLoss()
    optimizer = optim.AdamW(model.parameters(), lr=0.001, weight_decay=1e-4, betas=(0.9, 0.999))
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=50, eta_min=1e-6)

    # обучение модели
    num_epochs = 150
    train_losses = []
    val_losses = []
    best_val_loss = float('inf')
    patience = 25
    patience_counter = 0

    for epoch in range(num_epochs):
        model.train()
        epoch_train_loss = 0
        
        for batch_x, batch_y in train_loader:
            batch_x, batch_y = batch_x.to(device), batch_y.to(device)
            
            # проходим вперед
            outputs = model(batch_x)
            loss = criterion(outputs, batch_y)
            
            # проходим назад
            optimizer.zero_grad()
            loss.backward()
            
            # gradient clipping
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            
            epoch_train_loss += loss.item()
        
        # валидация модели
        model.eval()
        with torch.no_grad():
            val_outputs = model(x_val_tensor.to(device))
            val_loss = criterion(val_outputs, y_val_tensor.to(device))
        
        train_loss = epoch_train_loss / len(train_loader)
        train_losses.append(train_loss)
        val_losses.append(val_loss.item())
        
        scheduler.step()
        
        if (epoch + 1) % 10 == 0:
            current_lr = optimizer.param_groups[0]['lr']
            print(f'Epoch [{epoch+1}/{num_epochs}], Train Loss: {train_loss:.4f}, Val Loss: {val_loss.item():.4f}, LR: {current_lr:.6f}')

        # ранняя остановка
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            patience_counter = 0
            torch.save(model.state_dict(), 'best_model.pth')
        else:
            patience_counter += 1
        
        if patience_counter >= patience:
            print(f'Early stopping at epoch {epoch+1}')
            break

    # загружаем лучшую модель
    model.load_state_dict(torch.load('best_model.pth'))

    # визуализация обучения
    plt.figure(figsize=(12, 5))
    plt.subplot(1, 2, 1)
    plt.plot(train_losses, label='Training Loss')
    plt.plot(val_losses, label='Validation Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    plt.title('Training and Validation Loss')
    plt.savefig('training_loss.png')
    plt.show()

    # тестируем на реальных данных
    print("\n" + "="*50)
    print("ПРЕДСКАЗАНИЕ ПОГОДЫ НА 3 ДНЯ")
    print("="*50)

    test_sample = x_test[0]  # [7, n_features] - 7 дней, n_features параметров
    true_future = y_test[0]  # [3, 4] - реальные значения на следующие 3 дня

    prediction = predict_weather(model, test_sample, scaler_x, scaler_y)

    parameters = ['температура', 'влажность', 'давление', 'скорость ветра']
    units = ['°C', '%', 'гПа', 'м/с']

    print("\nпоследние 7 дней:")
    for i in range(7):
        print(f"день -{7-i}: " + ", ".join([f"{param}: {test_sample[i][j]:.1f}{unit}" 
        for j, (param, unit) in enumerate(zip(parameters, units))]))

    print("\nпредсказания на след 3 дня:")
    for i in range(3):
        print(f"день +{i+1}: " + ", ".join([f"{param}: {prediction[i][j]:.1f}{unit}" 
        for j, (param, unit) in enumerate(zip(parameters, units))]))

    print("\nреальные значения на след 3 дня:")
    for i in range(3):
        print(f"день +{i+1}: " + ", ".join([f"{param}: {true_future[i][j]:.1f}{unit}" 
        for j, (param, unit) in enumerate(zip(parameters, units))]))

    # оценка на всем тестовом наборе
    model.eval()
    with torch.no_grad():
        test_predictions = model(x_test_tensor.to(device))
        test_predictions = test_predictions.cpu().numpy()
        
        # обратно скейлим и решейпим
        test_predictions_original = scaler_y.inverse_transform(
            test_predictions.reshape(-1, 4)
        ).reshape(-1, 3, 4)
        
        y_test_original = scaler_y.inverse_transform(
            y_test_scaled.reshape(-1, 4)
        ).reshape(-1, 3, 4)

    # вычисляем MAE 
    mae = np.mean(np.abs(test_predictions_original - y_test_original), axis=(0, 1))
    print("\nСредняя абсолютная ошибка по параметрам:")
    for param, error, unit in zip(parameters, mae, units):
        print(f"{param}: {error:.2f} {unit}")

    # вычисляем общий test loss
    test_loss = criterion(torch.FloatTensor(test_predictions_original), torch.FloatTensor(y_test_original))
    print(f"\nОбщий Test Loss: {test_loss.item():.4f}")

    save_model_and_scalers(model, scaler_x, scaler_y)
    print("\nМодель и скейлеры сохранены!")