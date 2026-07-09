data "aws_ami" "default" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-2.0.*-x86_64-gp2"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

data "aws_vpc" "default" {
  count   = var.vpc_id == "" ? 1 : 0
  default = true
}

data "aws_vpc" "selected" {
  count = var.vpc_id != "" ? 1 : 0

  filter {
    name   = "vpc-id"
    values = [var.vpc_id]
  }
}

locals {
  selected_vpc_id = var.vpc_id != "" ? data.aws_vpc.selected[0].id : data.aws_vpc.default[0].id
}

data "aws_subnets" "selected" {
  filter {
    name   = "vpc-id"
    values = [local.selected_vpc_id]
  }
}

data "aws_route53_zone" "primary" {
  count = var.enable_route53_record ? 1 : 0
  name  = var.route53_zone_name
}
