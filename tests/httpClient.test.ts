import { afterEach, describe, expect, it, vi } from 'vitest'
import { HttpClient } from '../src/shared/api'

afterEach(() => vi.unstubAllGlobals())

describe('HttpClient 401 handling', () => {
  it('refreshes the access token and repeats the original request once', async () => {
    const client = new HttpClient('https://example.test')
    let token = 'expired-token'
    const refresh = vi.fn(async () => {
      token = 'fresh-token'
      return token
    })
    const unauthorized = vi.fn()
    client.setAuthHandlers({
      getAccessToken: () => token,
      refreshAccessToken: refresh,
      onUnauthorized: unauthorized,
    })

    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: 'Expired' }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 1 }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(client.request<{ id: number }>('/auth/me')).resolves.toEqual({ id: 1 })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get('Authorization'))
      .toBe('Bearer expired-token')
    expect(new Headers(fetchMock.mock.calls[1]?.[1]?.headers).get('Authorization'))
      .toBe('Bearer fresh-token')
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(unauthorized).not.toHaveBeenCalled()
  })

  it('clears authorization when refresh fails without retrying forever', async () => {
    const client = new HttpClient('https://example.test')
    const refresh = vi.fn(async () => { throw new Error('Refresh failed') })
    const unauthorized = vi.fn()
    client.setAuthHandlers({
      getAccessToken: () => 'expired-token',
      refreshAccessToken: refresh,
      onUnauthorized: unauthorized,
    })
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: 'Expired' }), { status: 401 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(client.request('/auth/me')).rejects.toMatchObject({ status: 401 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(unauthorized).toHaveBeenCalledTimes(1)
  })

  it('does not refresh an unauthenticated login request', async () => {
    const client = new HttpClient('https://example.test')
    const refresh = vi.fn(async () => 'fresh-token')
    client.setAuthHandlers({
      getAccessToken: () => 'expired-token',
      refreshAccessToken: refresh,
      onUnauthorized: vi.fn(),
    })
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 401 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(client.request('/auth/login', { method: 'POST', skipAuth: true }))
      .rejects.toMatchObject({ status: 401 })
    expect(refresh).not.toHaveBeenCalled()
    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).has('Authorization')).toBe(false)
  })
})
