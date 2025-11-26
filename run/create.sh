if [ -z "$1" ]; then
  echo "Usage: $0 <module-name>"
  exit 1
fi

MODULE_NAME="$1"
nest g module "$MODULE_NAME"
nest g controller "$MODULE_NAME" --no-spec
nest g service "$MODULE_NAME" --no-spec