terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.1"
    }
  }
  required_version = ">=1.2.0"

}

resource "aws_security_group" "allow_ssh_http" {
  name = "allow_ssh_http"
  description = "Allow SSH and HTTP inbound traffic and all outbound traffic"
  tags = {
    Name = "allow-ssh-http"
  }
}
resource "aws_vpc_security_group_egress_rule" "allow_all_traffic_ipv4" {
  security_group_id = aws_security_group.allow_ssh_http.id
  cidr_ipv4 = "0.0.0.0/0"
  ip_protocol = "-1"
}
resource "aws_vpc_security_group_ingress_rule" "allow_http" {
  security_group_id = aws_security_group.allow_ssh_http.id
  cidr_ipv4 = "0.0.0.0/0"
  ip_protocol = "tcp"
  from_port = 8080
  to_port = 8081
}
resource "aws_vpc_security_group_ingress_rule" "allow_ssh" {
  security_group_id = aws_security_group.allow_ssh_http.id
  cidr_ipv4 = "0.0.0.0/0"
  ip_protocol = "tcp"
  from_port = 22
  to_port = 22
}
resource "aws_iam_role" "ec2_role" {
  name               = "ec2_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "ec2_role_policy" {
  name   = "ec2_role_policy"
  role   = aws_iam_role.ec2_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "s3:*"
      Resource  = "*"
    }]
  })
}
resource "aws_iam_instance_profile" "ec2_instance_profile" {
  name = "ec2_instance_profile"
  role = aws_iam_role.ec2_role.name
}
resource "aws_instance" "app" {
  ami                          = "ami-080e1f13689e07408"
  instance_type                = "t2.small"
  associate_public_ip_address  = true
  vpc_security_group_ids       = [aws_security_group.allow_ssh_http.id]
  iam_instance_profile         = aws_iam_instance_profile.ec2_instance_profile.name
  user_data = <<-EOF
    #!/bin/bash

    echo "User data script started"

    sudo apt-get update
    sudo apt-get install -y docker.io
    sudo groupadd docker
    sudo usermod -aG docker $USER
    systemctl start docker
    systemctl enable docker

    IP_V4=$(curl -sS ifconfig.me | awk '{print $1}')

    docker run -d -p 8081:3000 \
    -e REACT_APP_SOCKET=ws://$IP_V4:8080 \
    -e REACT_APP_URL=http://$IP_V4:8080 \
    -e REACT_APP_AWS_PROJECT_REGION=X \
    -e REACT_APP_AWS_COGNITO_IDENTITY_POOL_ID=X \
    -e REACT_APP_AWS_COGNITO_REGION=X \
    -e REACT_APP_AWS_USER_POOLS_ID=X \
    -e REACT_APP_AWS_USER_POOLS_WEB_CLIENT_ID=X \
    -e REACT_APP_AWS_BUCKET_NAME=X vburmus/frontend:v2

    docker run -d -p 8080:8080 \
    -e COGNITO_URI=X \
    -e DB_URL=X \
    -e DB_USERNAME=X \
    -e DB_PASSWORD=X \
    -e BUCKET=X \
    -e REGION=X \
    -e LAMBDA_URL=X vburmus/backend:v2

    echo "User data script completed"
  EOF
  tags = {
    Name = "My EC2"
  }
}
