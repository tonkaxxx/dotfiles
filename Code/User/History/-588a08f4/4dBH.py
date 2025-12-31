import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command

from dotenv import load_dotenv
import os

load_dotenv()

API_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')

bot = Bot(token=API_TOKEN)
dp = Dispatcher()

user_data = {}

@dp.message(Command("start"))
async def start(message: types.Message):
    await message.answer("hi! type /data to start")

@dp.message(Command("data"))
async def data_start(message: types.Message):
    user_data[message.from_user.id] = {'step': 'sleep'}
    await message.answer("how long did you sleep today? ")

@dp.message()
async def all_messages(message: types.Message):
    user_id = message.from_user.id
    
    if user_id in user_data:
        if user_data[user_id]['step'] == 'sleep':
            user_data[user_id]['sleep'] = message.text
            user_data[user_id]['step'] = 'thoughts'
            await message.answer("any thoughts?")
        elif user_data[user_id]['step'] == 'thoughts':
            thoughts = message.text
            sleep = user_data[user_id]['sleep']
            await message.answer(f"Записал!\nСон: {sleep} часов\nМысли: {thoughts}")
            print(user_data)
            del user_data[user_id]

async def main():
    await dp.start_polling(bot)

asyncio.run(main())