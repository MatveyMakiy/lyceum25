import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getFeedEvents, getPublicEvents } from '../src/api/events.js';

function mockJsonResponse(data, ok = true) {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(data),
  });
}

describe('events api', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });
  it('loads public events without token', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        items: [
          {
            id: 'event-1',
            title: 'Публичное мероприятие',
            isPublic: true,
          },
        ],
      }),
    );
    const result = await getPublicEvents(3);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/public/events?limit=3'),
    );
    expect(result[0].title).toBe('Публичное мероприятие');
  });
  it('uses public events for guest feed', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        items: [
          {
            id: 'event-1',
            title: 'Гостевое мероприятие',
            isPublic: true,
          },
        ],
      }),
    );
    const result = await getFeedEvents(2);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/public/events?limit=2'),
    );
    expect(result[0].title).toBe('Гостевое мероприятие');
  });

  it('loads personal feed events with token', async () => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        items: [
          {
            id: 'event-2',
            title: 'Мероприятие моей группы',
          },
        ],
      }),
    );
    const result = await getFeedEvents(4);
    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain('/events?');
    expect(url).toContain('scope=my');
    expect(url).toContain('limit=4');
    expect(options.headers.Authorization).toBe('Bearer test-token');
    expect(result[0].title).toBe('Мероприятие моей группы');
  });
});
