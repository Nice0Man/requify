#!/usr/bin/env python3

import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.db_helper import get_async_session
from app.models.user import User
from sqlalchemy import select, update

async def update_user_username():
    async with get_async_session() as session:
        result = await session.execute(
            select(User).where(User.username.is_(None))
        )
        users = result.scalars().all()
        
        for i, user in enumerate(users):
            username = f'user{user.id}' if user.email != 'admin@example.com' else 'admin'
            await session.execute(
                update(User).where(User.id == user.id).values(username=username)
            )
            print(f'Updated user {user.email} with username: {username}')
        
        await session.commit()
        print(f'Updated {len(users)} users')

if __name__ == "__main__":
    asyncio.run(update_user_username())