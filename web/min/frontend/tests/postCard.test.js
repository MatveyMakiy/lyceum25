import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPostCard } from '../components/post/postCard.js';

describe('createPostCard', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
  });
  it('renders post author, text, date and likes count', () => {
    const card = createPostCard({
      id: 'post-1',
      authorId: 'user-1',
      author: 'Иван Иванов',
      text: 'Текст поста',
      date: '15.05.2026',
      likesCount: 3,
    });
    expect(card.className).toBe('post-card');
    expect(card.textContent).toContain('Иван Иванов');
    expect(card.textContent).toContain('Текст поста');
    expect(card.textContent).toContain('15.05.2026');
    expect(card.textContent).toContain('Нравится · 3');
  });
  it('disables like button for guest user', () => {
    const card = createPostCard({
      id: 'post-1',
      authorId: 'user-1',
      author: 'Иван Иванов',
      text: 'Текст поста',
      date: '15.05.2026',
      likesCount: 0,
    });
    const likeButton = card.querySelector('.post-card__like');
    expect(likeButton.disabled).toBe(true);
    expect(likeButton.title).toBe('Войдите, чтобы поставить лайк');
  });
  it('renders edit and delete actions for own post', () => {
    localStorage.setItem(
      'currentUser',
      JSON.stringify({
        id: 'user-1',
      }),
    );
    const card = createPostCard({
      id: 'post-1',
      authorId: 'user-1',
      author: 'Иван Иванов',
      text: 'Мой пост',
      date: '15.05.2026',
      likesCount: 0,
    });
    expect(card.textContent).toContain('Редактировать');
    expect(card.textContent).toContain('Удалить');
  });
  it('calls onLike and updates likes count', async () => {
    localStorage.setItem(
      'currentUser',
      JSON.stringify({
        id: 'user-1',
      }),
    );
    const onLike = vi.fn().mockResolvedValue({
      likesCount: 5,
    });
    const card = createPostCard(
      {
        id: 'post-1',
        authorId: 'user-2',
        author: 'Пётр Петров',
        text: 'Пост',
        date: '15.05.2026',
        likesCount: 4,
      },
      {
        onLike,
      },
    );
    const likeButton = card.querySelector('.post-card__like');
    likeButton.click();
    await Promise.resolve();
    await Promise.resolve();
    expect(onLike).toHaveBeenCalledWith('post-1');
    expect(likeButton.textContent).toContain('5');
  });
});