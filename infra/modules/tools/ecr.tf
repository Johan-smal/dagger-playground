resource "aws_ecr_repository" "app_ecr" {
  name                 = "app"
  image_tag_mutability = "MUTABLE"
}

output "app_ecr" {
  value = aws_ecr_repository.app_ecr
}

