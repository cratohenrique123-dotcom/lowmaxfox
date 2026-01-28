import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é um especialista em análise facial estética (looksmaxing).

Analise a foto frontal do rosto enviada e gere uma análise facial realista, técnica e coerente.

REGRAS OBRIGATÓRIAS:

1. ESCALA DE NOTAS (0-100):
   - Todas as notas devem variar de acordo com o rosto analisado
   - Nunca repita resultados genéricos
   - 70-80: aparência comum
   - 81-88: acima da média
   - 89-94: muito bonito(a)
   - 95-100: beleza excepcional (modelos/celebridades)

2. NOTA POTENCIAL:
   - SEMPRE entre 90 e 100
   - Representa o máximo de melhoria estética alcançável através de hábitos, skincare, postura, nutrição e consistência
   - Mesmo rostos abaixo da média devem ter alto potencial de melhoria
   - Potencial NUNCA pode ser menor que a Nota Geral

3. ANÁLISE POR CATEGORIA:
   - Mandíbula (jawline): definição frontal, largura mandibular, ângulo e continuidade da linha
   - Simetria facial: comparar olhos, sobrancelhas, nariz, boca e contorno entre os dois lados
   - Qualidade da pele: textura, uniformidade de tom, acne, oleosidade, marcas visíveis
   - Maçãs do rosto: volume frontal, projeção e proeminência estrutural
   - Nota Geral: baseada na avaliação equilibrada de todas as métricas

4. PONTOS FORTES (strengths):
   - Liste 2-3 traços faciais positivos REAIS observados na foto
   - Seja específico e único para cada análise

5. PONTOS FRACOS (weaknesses):
   - Liste 2-3 áreas com espaço realista para melhoria
   - Seja específico e baseado na foto

6. DICAS DE MELHORIA (tips):
   - Forneça dicas práticas e seguras (skincare, hábitos, postura, mewing leve, hidratação)
   - NÃO sugira procedimentos médicos ou cirúrgicos

7. REGRAS IMPORTANTES:
   - NÃO mencione limitações técnicas
   - NÃO diga que é uma simulação
   - Evite linguagem genérica
   - Adapte a análise ESTRITAMENTE à imagem fornecida
   - Cada análise deve ser ÚNICA
   - Use vocabulário variado, refletindo características únicas do rosto

FORMATO DE RESPOSTA (JSON apenas):
{
  "overall": number (30-100),
  "potential": number (90-100),
  "jawline": number (30-100),
  "symmetry": number (30-100),
  "skinQuality": number (30-100),
  "cheekbones": number (30-100),
  "strengths": ["string", "string", "string"],
  "weaknesses": ["string", "string", "string"],
  "tips": ["string", "string", "string"]
}

Retorne APENAS o JSON, sem texto adicional.`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      console.error("No image provided in request");
      return new Response(
        JSON.stringify({ error: "Imagem não fornecida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Starting facial analysis with Lovable AI...");
    console.log("Image size:", Math.round(imageBase64.length / 1024), "KB");

    // Prepare the image for the API
    // Handle both data URL and raw base64
    let imageDataUrl = imageBase64;
    if (!imageBase64.startsWith("data:")) {
      imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analise esta foto frontal do rosto e retorne a análise facial completa em JSON."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageDataUrl
                }
              }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos esgotados. Entre em contato com o suporte." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.error("No content in AI response:", data);
      throw new Error("Resposta inválida da IA");
    }

    console.log("Raw AI response:", content.substring(0, 200));

    // Parse the JSON from the response
    let analysisResult;
    try {
      // Try to extract JSON from the response (might be wrapped in markdown)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.error("Content was:", content);
      throw new Error("Falha ao processar resposta da IA");
    }

    // Validate and ensure all required fields
    const result = {
      overall: Math.min(100, Math.max(30, analysisResult.overall || 70)),
      potential: Math.min(100, Math.max(90, analysisResult.potential || 95)),
      jawline: Math.min(100, Math.max(30, analysisResult.jawline || 65)),
      symmetry: Math.min(100, Math.max(30, analysisResult.symmetry || 70)),
      skinQuality: Math.min(100, Math.max(30, analysisResult.skinQuality || 65)),
      cheekbones: Math.min(100, Math.max(30, analysisResult.cheekbones || 65)),
      strengths: analysisResult.strengths || ["Estrutura facial equilibrada", "Bom potencial de melhoria", "Traços definidos"],
      weaknesses: analysisResult.weaknesses || ["Pode melhorar hidratação", "Postura pode ser otimizada", "Skincare pode ser aprimorado"],
      tips: analysisResult.tips || ["Mantenha uma rotina de skincare", "Pratique mewing leve", "Hidrate-se adequadamente"],
    };

    // Ensure potential is always >= overall
    if (result.potential < result.overall) {
      result.potential = Math.min(100, result.overall + 5);
    }

    console.log("Analysis complete:", JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-face error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro ao analisar imagem" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
