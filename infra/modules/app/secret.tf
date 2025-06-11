resource "aws_secretsmanager_secret" "app_key" {
  name        = "app-key"
  description = "Secret for the application"
}
resource "aws_secretsmanager_secret_version" "app_key_version" {
  secret_id     = aws_secretsmanager_secret.app_key.id
  secret_string = var.app_key
}
