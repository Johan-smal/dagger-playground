resource "random_string" "app_key_suffix" {
  length  = 6
  upper   = false
  special = false
}
resource "aws_secretsmanager_secret" "app_key" {
  name        = "ecs/app-key-${random_string.app_key_suffix.result}"
  description = "Secret for the application"
}
resource "aws_secretsmanager_secret_version" "app_key_version" {
  secret_id     = aws_secretsmanager_secret.app_key.id
  secret_string = var.app_key
}
