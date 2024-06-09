resource "aws_iam_role" "lambda_rds_ec2_role" {
  name = "LambdaRDSRoleWithEC2"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect    = "Allow",
      Principal = {
        Service = "lambda.amazonaws.com"
      },
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_rds_ec2_role_attachment" {
  role       = aws_iam_role.lambda_rds_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_policy" "lambda_ec2_policy" {
  name        = "LambdaEC2Policy"
  description = "Policy for Lambda to interact with EC2 instances"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect    = "Allow",
      Action    = [
        "ec2:CreateNetworkInterface",
        "ec2:DescribeNetworkInterfaces",
        "ec2:DeleteNetworkInterface"
      ],
      Resource  = "*"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_ec2_policy_attachment" {
  role       = aws_iam_role.lambda_rds_ec2_role.name
  policy_arn = aws_iam_policy.lambda_ec2_policy.arn
}
resource "aws_iam_policy" "lambda_sns_policy" {
  name        = "LambdaSNSPublishPolicy"
  description = "Policy for Lambda to publish to SNS topic"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect    = "Allow",
      Action    = [
        "sns:Publish",
        "sns:Subscribe"]
      Resource  = "arn:aws:sns:us-east-1:590183993143:UsersRatingsUpdate"
    }]
  })
}

# Attach SNS Publish policy to the Lambda role
resource "aws_iam_role_policy_attachment" "lambda_sns_policy_attachment" {
  role       = aws_iam_role.lambda_rds_ec2_role.name
  policy_arn = aws_iam_policy.lambda_sns_policy.arn
}

resource "aws_lambda_layer_version" "layer" {
  filename                 =  "${path.module}/lambda/python.zip"
  layer_name               = "PythonLinLayer"
  compatible_runtimes      = ["python3.12", "python3.11", "python3.10"]
  compatible_architectures = ["x86_64"]
}
resource "aws_lambda_function" "update_ratings" {
  function_name = "update-ratings"
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.12"
  role          = aws_iam_role.lambda_rds_ec2_role.arn
  filename      = "${path.module}/lambda/lambda_function.zip"
  architectures = ["x86_64"]

  layers = [aws_lambda_layer_version.layer.arn]
  environment {
    variables = {
      RDS_HOST      = aws_db_instance.myinstance.address
      RDS_USER      = aws_db_instance.myinstance.username
      RDS_PASSWORD  = aws_db_instance.myinstance.password
      DB_NAME       = "tictactoe"
      SNS_TOPIC_ARN = aws_sns_topic.user_ratings_update.arn
    }
  }
  vpc_config {
    security_group_ids = [aws_security_group.db_access.id]
    subnet_ids         = data.aws_subnets.default.ids
  }
}
resource "aws_lambda_permission" "allow_public_access" {
  statement_id           = "FunctionURLAllowPublicAccess"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.update_ratings.function_name
  principal              = "*"
  function_url_auth_type = "NONE"
}
resource "aws_lambda_function_url" "update_rating_url" {
  function_name = aws_lambda_function.update_ratings.function_name
  authorization_type = "NONE"
}
output "function_url" {
  value = aws_lambda_function_url.update_rating_url.function_url
}