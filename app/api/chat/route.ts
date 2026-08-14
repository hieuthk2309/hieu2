import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'

// Remove edge runtime for better local dev compatibility + error reporting
// export const runtime = 'edge'

const SYSTEM_PROMPT = `Bạn là trợ lý AI thân thiện của quán "Bánh Mì Hieudeptrai" 🥖.
Nhiệm vụ của bạn là hỗ trợ khách hàng về thông tin quán, thực đơn, đặt hàng và giải đáp thắc mắc.

## Thông tin quán
- Tên: Bánh Mì Hieudeptrai
- Slogan: Ngon - Tận nơi - Tiện
- Giờ mở cửa: 6:00 – 6:00, Thứ 2 đến Thứ 6 (nghỉ Thứ 7, Chủ Nhật)
- Điện thoại: 0799132435

## Thực đơn

### Bánh Mì
| Món | Mô tả | Giá |
|-----|-------|-----|
| Bánh Mì Đặc Biệt ⭐ | Chả cá chiên giòn + trứng chiên + dưa leo + rau răm + nước sốt + tương ớt | 20.000đ |
| Bánh Mì Chả Cá | Chả cá chiên giòn + dưa leo + rau răm + nước sốt + tương ớt | 15.000đ |
| Bánh Mì Trứng Ốp La | Trứng ốp la + dưa leo + rau răm + nước sốt + tương ớt | 15.000đ |
| Bánh Mì Siêu Chả Cá | Nhiều chả cá hơn + dưa leo + rau răm + nước sốt + tương ớt | 20.000đ |

### Đồ Uống
| Món | Mô tả | Giá |
|-----|-------|-----|
| Cà Phê Đen ⭐ | Cà phê nguyên chất pha phin truyền thống | 15.000đ |
| Cà Phê Sữa | Cà phê đen + sữa đặc béo ngậy | 20.000đ |
| Trà Tắc | Trà kozi + tắc chua ngọt | 10.000đ |
| Trà Đường | Trà kozi + đường | 5.000đ |

## Hướng dẫn trả lời
- Trả lời bằng tiếng Việt, thân thiện, vui vẻ, dùng emoji phù hợp
- Khi khách hỏi về menu, hãy giới thiệu đầy đủ với giá
- Khuyến khích khách đặt hàng qua website
- Nếu khách muốn đặt hàng: hướng dẫn click "Thực Đơn" ở tab trên trang web
- Không bịa thông tin, nếu không biết thì nói thật
- Giữ câu trả lời ngắn gọn, súc tích (không quá 200 từ mỗi tin nhắn)`

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const groqKey = process.env.GROQ_API_KEY
    const openAiKey = process.env.OPENAI_API_KEY || process.env.AI_GATEWAY_API_KEY

    let providerModel

    if (groqKey) {
      const groq = createOpenAI({
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: groqKey,
      })
      providerModel = groq.chat('llama-3.3-70b-versatile')
    } else if (openAiKey && !openAiKey.startsWith('vck_')) {
      const openai = createOpenAI({
        apiKey: openAiKey,
      })
      providerModel = openai('gpt-4o-mini')
    } else if (openAiKey && openAiKey.startsWith('vck_')) {
      const openai = createOpenAI({
        baseURL: 'https://ai-gateway.vercel.sh/v1',
        apiKey: openAiKey,
      })
      providerModel = openai('gpt-4o-mini')
    }

    if (providerModel) {
      try {
        const result = streamText({
          model: providerModel,
          system: SYSTEM_PROMPT,
          messages,
          maxOutputTokens: 500,
          temperature: 0.7,
        })
        return result.toTextStreamResponse()
      } catch (streamErr) {
        console.warn('StreamText error, falling back to local assistant:', streamErr)
      }
    }

    // Trợ lý offline fallback thông minh nếu chưa có API Key hoặc gặp lỗi provider
    const lastUserMessage = messages?.slice()?.reverse()?.find((m: any) => m.role === 'user')?.content?.toLowerCase() || ''
    const fallbackReply = generateFallbackReply(lastUserMessage)

    return new Response(fallbackReply, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error: any) {
    console.error('[/api/chat] Error:', error)
    const fallbackReply = generateFallbackReply('')
    return new Response(fallbackReply, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
}

function generateFallbackReply(query: string): string {
  const q = query.toLowerCase()

  if (q.includes('thực đơn') || q.includes('menu') || q.includes('món') || q.includes('bánh mì') || q.includes('nước') || q.includes('giá')) {
    return `🥖 **Menu Bánh Mì Hieudeptrai:**
• **Bánh Mì Đặc Biệt ⭐**: 20.000đ (Chả cá chiên giòn + trứng chiên + sốt)
• **Bánh Mì Siêu Chả Cá**: 20.000đ
• **Bánh Mì Chả Cá**: 15.000đ
• **Bánh Mì Trứng Ốp La**: 15.000đ

☕ **Đồ Uống:**
• Cà Phê Đen: 15.000đ | Cà Phê Sữa: 20.000đ
• Trà Tắc: 10.000đ | Trà Đường: 5.000đ

👉 Bạn có thể chuyển sang tab **"Thực Đơn"** ở trên để chọn món và đặt hàng nhanh nhé!`
  }

  if (q.includes('giờ') || q.includes('mở cửa') || q.includes('đóng cửa') || q.includes('thời gian')) {
    return `⏰ **Giờ mở cửa của quán:**
- **6:00 – 21:00** (Thứ 2 đến Thứ 6)
- Nghỉ Thứ 7 & Chủ Nhật
- Hotline hỗ trợ: **0799132435** 🥖`
  }

  if (q.includes('đặt') || q.includes('mua') || q.includes('order') || q.includes('giao')) {
    return `🛒 Để đặt hàng nhanh nhất:
1. Bạn chọn tab **"Thực Đơn"** ở thanh điều hướng phía trên
2. Bấm chọn món bạn thích vào giỏ hàng
3. Điền thông tin giao hàng và bấm **"Đặt hàng"** nhé! 🥖`
  }

  if (q.includes('sdt') || q.includes('điện thoại') || q.includes('liên hệ') || q.includes('địa chỉ')) {
    return `📞 **Thông tin liên hệ quán Bánh Mì Hieudeptrai:**
- Điện thoại / Zalo: **0799132435**
- Giờ hoạt động: **6:00 – 21:00** (T2 - T6)
- Slogan: *Ngon - Nhanh - Tiện* 🥖`
  }

  return `Chào bạn! Mình là trợ lý AI quán **Bánh Mì Hieudeptrai** 🥖. 
Mình có thể giúp bạn xem **Thực đơn & Giá**, kiểm tra **Giờ mở cửa**, hoặc hướng dẫn **Đặt hàng**. 
Bạn cần mình hỗ trợ thông tin gì nào? 😊`
}
