import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createDirectChat,
  getChatById,
  getChats,
  getOrCreateGroupChat,
  sendChatMessage,
} from '../src/api/chats.js';

function mockJsonResponse(data, ok = true) {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(data),
  });
}

describe('chats api', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
    vi.restoreAllMocks();
  });
  it('loads chats', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse([
        {
          id: 'chat-1',
        },
      ]),
    );
    const result = await getChats();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/chats'),
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer test-token',
        },
      }),
    );
    expect(result[0].id).toBe('chat-1');
  });
  it('creates direct chat', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        id: 'chat-1',
      }),
    );
    const result = await createDirectChat('user-2');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/chats/direct'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          userId: 'user-2',
        }),
      }),
    );
    expect(result.id).toBe('chat-1');
  });
  it('loads chat by id', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        id: 'chat-1',
        messages: [],
      }),
    );
    const result = await getChatById('chat-1');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/chats/chat-1'),
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer test-token',
        },
      }),
    );
    expect(result.id).toBe('chat-1');
  });
  it('sends chat message', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        id: 'message-1',
        content: 'Привет',
      }),
    );
    const result = await sendChatMessage('chat-1', 'Привет');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/chats/chat-1/messages'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          content: 'Привет',
        }),
      }),
    );
    expect(result.content).toBe('Привет');
  });
  it('gets or creates group chat', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        id: 'group-chat-1',
      }),
    );
    const result = await getOrCreateGroupChat('group-1');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/groups/group-1/chat'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-token',
        },
      }),
    );
    expect(result.id).toBe('group-chat-1');
  });
  it('throws server error', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse(
        {
          message: 'У вас нет доступа к этому чату',
        },
        false,
      ),
    );
    await expect(getChatById('bad-id')).rejects.toThrow(
      'У вас нет доступа к этому чату',
    );
  });
});