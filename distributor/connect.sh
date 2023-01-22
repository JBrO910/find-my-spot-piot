if [ $# -ne 2 ]; then
    echo "Usage: $0 <garage_id> <api_key>"
    exit 1
fi

cp .env.template .env

echo "GARAGE_ID=$1" >> .env
echo "API_KEY=$2" >> .env
