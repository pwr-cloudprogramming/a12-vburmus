data "http" "my_ip" {
  url = "https://api.ipify.org"
}
resource "aws_security_group" "db_access" {
  name        = "a12-sg"
  description = "Allow access to db and https"
  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["172.31.0.0/16"]
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Name = "a12-sg"
  }
}

resource "aws_db_instance" "myinstance" {
  engine                 = "mysql"
  identifier             = "myrdsinstance"
  allocated_storage      = 20
  engine_version         = "5.7"
  instance_class         = "db.t3.micro"
  username               = "myrdsuser"
  password               = "myrdspassword"
  parameter_group_name   = "default.mysql5.7"
  vpc_security_group_ids = ["${aws_security_group.db_access.id}"]
  skip_final_snapshot    = true
  publicly_accessible    = true
}
output "security_group_id" {
  value = aws_security_group.db_access.id
}
output "db_instance_endpoint" {
  value = aws_db_instance.myinstance.endpoint
}
