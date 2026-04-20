FROM ros:humble

# Deploy Real Operating Layer bindings across the Linux matrix.
RUN apt-get update && apt-get install -y \
  python3-pip \
  && pip install redis json

COPY ./ /app
WORKDIR /app

# Ensure exact executable commands route correctly
CMD ["python3", "main.py"]
