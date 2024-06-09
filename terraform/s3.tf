resource "aws_s3_bucket" "vbbucket" {
  bucket = "vb-bucket-v1"
  tags = {
    Name = "PublicReadBucket"
  }
}
resource "aws_s3_bucket_public_access_block" "policies" {
  bucket = aws_s3_bucket.vbbucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "public_bucket_policy" {
  bucket = aws_s3_bucket.vbbucket.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect    = "Allow",
      Principal = "*",
      Action    = "s3:GetObject",
      Resource  = "${aws_s3_bucket.vbbucket.arn}/*",
    }],
  })
}
output "s3_bucket_name" {
  value = aws_s3_bucket.vbbucket.bucket
  description = "The name of the S3 bucket"
}
# Deprecated version - worked on 05.06
#resource "aws_s3_bucket" "vb-bucket" {
#  bucket = "vb-bucket-v1"
#  acl = "public-read"
#  lifecycle {
#    ignore_changes = [
#      acl
#    ]
#  }
#  tags = {
#    Name = "PublicBucket"
#  }
#}
#output "s3_bucket_name" {
#  value = aws_s3_bucket.vb-bucket.bucket
#  description = "The name of the S3 bucket"
#}
