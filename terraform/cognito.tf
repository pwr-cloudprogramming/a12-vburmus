provider "aws" {
  region = "us-east-1"
}
resource "aws_cognito_user_pool" "the_cafe" {
  name = "the_cafe"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_uppercase = true
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
  }

  mfa_configuration = "OFF"

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }
}
resource "aws_cognito_user_pool_client" "the_cafe_app_client" {
  name                         = "the_cafe_app_client"
  user_pool_id                 = aws_cognito_user_pool.the_cafe.id
  generate_secret              = false
  callback_urls                = ["http://localhost:3000/"]
  allowed_oauth_flows          = ["implicit"]
  allowed_oauth_scopes         = ["email", "openid"]
  supported_identity_providers = ["COGNITO"]

  allowed_oauth_flows_user_pool_client = true
  explicit_auth_flows                  = ["ALLOW_USER_SRP_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
}
resource "aws_cognito_resource_server" "cafe_resource_server" {
  user_pool_id = aws_cognito_user_pool.the_cafe.id
  identifier   = "http://localhost:8080/"
  name         = "cafe_resource_server"
  scope {
    scope_name        = "create_report"
    scope_description = "Access to create report"
  }
}
resource "aws_cognito_user" "frank" {
  user_pool_id       = aws_cognito_user_pool.the_cafe.id
  username           = "frank@example.com"
  temporary_password = "InitialPassword123!"

  lifecycle {
    ignore_changes = ["password"]
  }

  attributes = {
    email = "frank@example.com"
  }

  force_alias_creation = false
  message_action       = "SUPPRESS"
}
# Outputs
output "user_pool_id" {
  value       = aws_cognito_user_pool.the_cafe.id
  description = "The ID of the Cognito User Pool"
}
output "user_pool_client_id" {
  value       = aws_cognito_user_pool_client.the_cafe_app_client.id
  description = "The ID of the Cognito User Pool Client"
}
output "user_pool_client_secret" {
  value       = aws_cognito_user_pool_client.the_cafe_app_client.client_secret
  description = "The secret of the Cognito User Pool Client"
  sensitive   = true
}
output "resource_server_id" {
  value       = aws_cognito_resource_server.cafe_resource_server.id
  description = "The ID of the Cognito Resource Server"
}
output "resource_server_identifier" {
  value       = aws_cognito_resource_server.cafe_resource_server.identifier
  description = "The identifier of the Cognito Resource Server"
}
output "test_user_username" {
  value       = aws_cognito_user.frank.username
  description = "The username of the test user"
}