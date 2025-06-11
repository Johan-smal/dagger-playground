resource "aws_ecr_repository" "app_ecr" {
  name                 = "app"
  image_tag_mutability = "MUTABLE"
}

# data "aws_ecr_image" "app_image" {
#   repository_name = aws_ecr_repository.app_ecr.name
#   image_tag       = "latest"
# }

output "app_ecr" {
  value = aws_ecr_repository.app_ecr
}

