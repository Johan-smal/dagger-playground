variable "aws_region" {
  type    = string
  default = "eu-central-1"
}
variable "app_key" {
  type        = string
  description = "Base64 encoded application key for Laravel"
}
