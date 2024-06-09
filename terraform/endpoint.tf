data "aws_vpc" "default" {
  id = "vpc-0b7ec77bc7cbb5efe"
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

resource "aws_vpc_endpoint" "sns" {
  vpc_id            = data.aws_vpc.default.id
  service_name      = "com.amazonaws.us-east-1.sns"
  vpc_endpoint_type = "Interface"

  subnet_ids = data.aws_subnets.default.ids
  security_group_ids = [aws_security_group.db_access.id]

  tags = {
    Name = "sns-vpc-endpoint"
  }
}