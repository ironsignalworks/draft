import { delay, http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/user', async ({ request }) => {
    const url = new URL(request.url);
    const mode = url.searchParams.get('mode');

    if (mode === 'slow') {
      await delay(2000);
    }

    if (mode === 'timeout') {
      await delay('infinite');
      return HttpResponse.json({});
    }

    if (mode === 'error') {
      return new HttpResponse(null, { status: 500 });
    }

    if (mode === 'invalid') {
      return HttpResponse.json({ id: 123, name: null });
    }

    if (mode === 'empty') {
      return HttpResponse.json({});
    }

    return HttpResponse.json({
      id: 'user-1',
      name: 'Draft User',
      email: 'draft@example.com',
      role: 'user',
    });
  }),
];
