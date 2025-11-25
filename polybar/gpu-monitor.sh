#!/bin/bash

get_gpu_usage() {
    usage=$(timeout 1 radeontop -d - -l 1 | grep -o 'gpu [0-9]*\.[0-9]*' | cut -d' ' -f2)
    if [ -n "$usage" ]; then
        usage_int=$(printf "%.0f" "$usage")
        echo "$usage_int"
    else
        echo "0"
    fi
}

USAGE=$(get_gpu_usage)
echo "${USAGE}%"
