import asyncmy
from quart import current_app


async def get_pool():
    if not hasattr(current_app, "db_pool"):
        current_app.db_pool = await asyncmy.create_pool(
            host="127.0.0.1",
            port=3306,
            user="root",
            password="Dev1234",
            db="wariplay",
            autocommit=True
        )

    return current_app.db_pool