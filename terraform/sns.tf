resource "aws_sns_topic" "user_ratings_update" {
  name = "UsersRatingsUpdate"
  tags = {
    Name = "UserRatingsUpdate"
  }
}
output "sns_topic_arn" {
  value = aws_sns_topic.user_ratings_update.arn
}