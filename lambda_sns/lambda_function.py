import pymysql
import boto3
import os
rds_host = os.environ['RDS_HOST']
name = os.environ['RDS_USER']
password = os.environ['RDS_PASSWORD']
db_name = os.environ['DB_NAME']
sns = boto3.client('sns')
sns_topic_arn = os.environ['SNS_TOPIC_ARN']

def lambda_handler(event, context):
    connection = None
    try:
        print(f"Trying to connect to {rds_host}, cred ={name}:{password}, db_name: {db_name}")
        connection = pymysql.connect(host=rds_host, user=name, password=password, db=db_name, connect_timeout=10)
        with connection.cursor() as cursor:
            email_rating = get_rating(cursor)
            update_rating(cursor, connection)
            if email_rating:
                subscribe_to_topics(email_rating, cursor, connection)
                send_sns_notification(email_rating)
        print("Success...")


    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'body': str(e)
        }
    finally:
        connection.close()

    return {
        'statusCode': 200,
        'body': 'Rankings updated successfully'
    }


def send_sns_notification(email_rating):
    print("Publish to " + sns_topic_arn)
    for email,_ in email_rating.items():
        try:
            sns.publish(
                TopicArn=sns_topic_arn,
                Message=f"Your rating has been updated. Check it out now!"
            )
        except Exception as e:
            print(e)
            return {
                'statusCode': 500,
                'body': str(e)
            }
        print(f"Sent SNS notification to {email}")


def subscribe_to_topics(email_rating, cursor, connection):
    print("Subscribing to: ")
    print(email_rating)
    for email, info in email_rating.items():

        subscribed = info.get('subscribed', None)
        print(subscribed)
        if subscribed==b'\x00':
            # if subscribed==False:

            sns.subscribe(
                TopicArn=sns_topic_arn,
                Protocol='email',
                Endpoint=email
            )
            print(f"Subscribed {email} to SNS topic")
            cursor.execute("UPDATE users SET subscribed = %s WHERE email = %s", (True, email))
            connection.commit()
        else:
            print(f"Skipping {email} as they are  subscribed.")




def update_rating(cursor, connection):
    print("Updating rating...")
    cursor.execute("""
                UPDATE users
                SET rating = wins * 3 - loses
            """)
    connection.commit()


def get_rating(cursor):
    print("Fetching current ratings and emails...")
    cursor.execute("SELECT email, rating,subscribed FROM users")
    rows = cursor.fetchall()
    email_to_rating = {row[0]: {'rating': row[1], 'subscribed': row[2]} for row in rows}
    print("Current email to rating mapping:", email_to_rating)
    return email_to_rating
