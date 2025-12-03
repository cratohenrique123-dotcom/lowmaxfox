import { useState } from "react";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { ChevronRight, Smile, Droplets, Ruler, Sparkles, Calendar, Activity } from "lucide-react";
import guideMewing from "@/assets/guide-mewing.jpg";
import guideSkincare from "@/assets/guide-skincare.jpg";
import guideJawline from "@/assets/guide-jawline.jpg";
import guideSymmetry from "@/assets/guide-symmetry.jpg";

const guides = [
  {
    id: "mewing",
    title: "Guia de Mewing",
    icon: Smile,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    image: guideMewing,
    description: "Técnica para definir mandíbula",
    content: {
      intro: "Mewing é uma técnica de postura da língua desenvolvida pelo ortodontista Dr. John Mew. Quando praticada corretamente e consistentemente, pode ajudar a melhorar a estrutura facial.",
      sections: [
        {
          title: "O que é Mewing?",
          text: "Mewing consiste em manter a língua inteira pressionada contra o céu da boca (palato), incluindo a parte de trás da língua. Isso promove uma postura facial ideal e pode, ao longo do tempo, contribuir para uma mandíbula mais definida."
        },
        {
          title: "Como praticar",
          steps: [
            "Feche a boca e mantenha os dentes levemente encostados",
            "Pressione toda a língua contra o céu da boca",
            "A ponta da língua deve ficar atrás dos dentes superiores, sem tocá-los",
            "Respire pelo nariz",
            "Mantenha essa posição o máximo possível durante o dia"
          ]
        },
        {
          title: "Erros comuns",
          steps: [
            "Pressionar apenas a ponta da língua",
            "Forçar demais e causar tensão",
            "Respirar pela boca",
            "Desistir cedo demais - resultados levam meses"
          ]
        },
        {
          title: "Benefícios esperados",
          steps: [
            "Mandíbula mais definida",
            "Melhora na respiração",
            "Postura melhor do pescoço",
            "Face mais harmônica"
          ]
        }
      ]
    }
  },
  {
    id: "skincare",
    title: "Guia de Skincare",
    icon: Droplets,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    image: guideSkincare,
    description: "Rotina básica para pele saudável",
    content: {
      intro: "Uma rotina de skincare consistente é essencial para manter a pele saudável, prevenir problemas e melhorar a aparência geral do rosto.",
      sections: [
        {
          title: "Rotina Básica (Manhã)",
          steps: [
            "Lavar o rosto com água morna e sabonete facial suave",
            "Aplicar um sérum com vitamina C (opcional)",
            "Hidratar com creme adequado ao seu tipo de pele",
            "Finalizar com protetor solar FPS 30 ou mais"
          ]
        },
        {
          title: "Rotina Básica (Noite)",
          steps: [
            "Remover maquiagem/sujeira com demaquilante ou óleo",
            "Lavar com sabonete facial",
            "Aplicar tratamentos específicos (ácidos, retinol)",
            "Hidratar bem a pele"
          ]
        },
        {
          title: "Ingredientes importantes",
          steps: [
            "Ácido Hialurônico - hidratação profunda",
            "Niacinamida - controle de oleosidade e poros",
            "Vitamina C - antioxidante e luminosidade",
            "Retinol - renovação celular (usar à noite)"
          ]
        },
        {
          title: "Dicas extras",
          steps: [
            "Nunca durma de maquiagem",
            "Troque fronhas regularmente",
            "Beba bastante água",
            "Evite tocar o rosto com as mãos"
          ]
        }
      ]
    }
  },
  {
    id: "jawline",
    title: "Guia de Mandíbula",
    icon: Activity,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    image: guideJawline,
    description: "Exercícios para definição",
    content: {
      intro: "Uma mandíbula bem definida é um dos traços mais desejados. Além do mewing, existem exercícios e hábitos que podem ajudar.",
      sections: [
        {
          title: "Exercícios de mandíbula",
          steps: [
            "Chin lifts: Olhe para cima e projete o queixo, mantendo 10s",
            "Jaw clenches: Cerre os dentes suavemente por 5s, relaxe",
            "Neck curls: Deite e levante apenas a cabeça, 10 repetições",
            "Faça 2-3 séries de cada, diariamente"
          ]
        },
        {
          title: "Mastigação correta",
          steps: [
            "Mastigue dos dois lados igualmente",
            "Chiclete sem açúcar pode ajudar (com moderação)",
            "Evite mastigar apenas de um lado",
            "Alimentos mais duros fortalecem os músculos"
          ]
        },
        {
          title: "O que evitar",
          steps: [
            "Ganho excessivo de gordura corporal",
            "Postura ruim (pescoço para frente)",
            "Respiração pela boca",
            "Tensão excessiva na mandíbula (bruxismo)"
          ]
        }
      ]
    }
  },
  {
    id: "cheekbones",
    title: "Guia de Maçãs do Rosto",
    icon: Sparkles,
    color: "text-pink-400",
    bgColor: "bg-pink-500/20",
    description: "Realce natural das maçãs",
    content: {
      intro: "Maçãs do rosto proeminentes dão estrutura e harmonia ao rosto. Embora a genética seja importante, há formas de realçá-las.",
      sections: [
        {
          title: "Exercícios faciais",
          steps: [
            "Sorria amplamente e mantenha por 10 segundos",
            "Faça biquinho e depois sorria, alternando",
            "Sugue as bochechas (face de peixe) por 5 segundos",
            "Repita cada exercício 10-15 vezes"
          ]
        },
        {
          title: "Mewing e maçãs do rosto",
          steps: [
            "A postura correta da língua pode elevar o maxilar",
            "Com o tempo, isso pode realçar as maçãs",
            "Seja consistente e paciente"
          ]
        },
        {
          title: "Dicas adicionais",
          steps: [
            "Manter baixo percentual de gordura corporal",
            "Boa hidratação para pele firme",
            "Massagem facial para estimular circulação",
            "Protetor solar para prevenir flacidez"
          ]
        }
      ]
    }
  },
  {
    id: "symmetry",
    title: "Guia de Simetria Facial",
    icon: Ruler,
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    image: guideSymmetry,
    description: "Melhorar equilíbrio do rosto",
    content: {
      intro: "A simetria facial é associada à atratividade. Embora ninguém seja perfeitamente simétrico, alguns hábitos podem minimizar assimetrias.",
      sections: [
        {
          title: "Hábitos de sono",
          steps: [
            "Prefira dormir de barriga para cima",
            "Use travesseiro de altura adequada",
            "Evite dormir sempre do mesmo lado",
            "Mantenha horários regulares de sono"
          ]
        },
        {
          title: "Postura diária",
          steps: [
            "Não apoie o rosto na mão",
            "Mantenha a coluna ereta",
            "Distribua o peso igualmente ao sentar",
            "Evite cruzar sempre a mesma perna"
          ]
        },
        {
          title: "Mastigação equilibrada",
          steps: [
            "Mastigue dos dois lados igualmente",
            "Observe qual lado você usa mais",
            "Faça um esforço consciente para equilibrar"
          ]
        },
        {
          title: "Exercícios de mobilidade",
          steps: [
            "Mova a mandíbula suavemente de lado a lado",
            "Faça círculos com a mandíbula",
            "Massageie os músculos faciais regularmente",
            "Relaxe a tensão do rosto conscientemente"
          ]
        }
      ]
    }
  },
  {
    id: "routine",
    title: "Guia de Rotina Diária",
    icon: Calendar,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
    description: "Rotina completa de looksmaxing",
    content: {
      intro: "Uma rotina diária consistente é a chave para resultados. Aqui está um guia completo para maximizar sua aparência.",
      sections: [
        {
          title: "Manhã",
          steps: [
            "Acordar e beber um copo de água",
            "Skincare: lavar, hidratar, protetor solar",
            "Verificar postura ao escovar os dentes",
            "Praticar mewing desde que acorda"
          ]
        },
        {
          title: "Durante o dia",
          steps: [
            "Manter mewing consistente",
            "Beber água regularmente (2L+ total)",
            "Manter boa postura ao trabalhar/estudar",
            "Fazer pausas para alongar pescoço e costas"
          ]
        },
        {
          title: "Noite",
          steps: [
            "Skincare noturno completo",
            "Exercícios faciais (5-10 minutos)",
            "Preparar ambiente para sono de qualidade",
            "Dormir 7-8 horas em posição adequada"
          ]
        },
        {
          title: "Semanalmente",
          steps: [
            "Esfoliação suave (1-2x por semana)",
            "Máscara facial hidratante",
            "Revisar e ajustar hábitos",
            "Tirar fotos para acompanhar evolução"
          ]
        }
      ]
    }
  }
];

export default function GuidesPage() {
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);

  const guide = guides.find((g) => g.id === selectedGuide);

  if (guide) {
    return (
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-lg border-b border-border z-40 px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedGuide(null)} className="text-muted-foreground">
              ← Voltar
            </button>
            <h1 className="font-bold text-lg">{guide.title}</h1>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Hero with Image */}
          <div className="relative rounded-2xl overflow-hidden">
            {guide.image ? (
              <img 
                src={guide.image} 
                alt={guide.title}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className={`w-full h-48 ${guide.bgColor} flex items-center justify-center`}>
                <guide.icon className={`w-20 h-20 ${guide.color}`} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl font-bold mb-1">{guide.title}</h2>
              <p className="text-sm text-muted-foreground">{guide.description}</p>
            </div>
          </div>

          {/* Intro */}
          <Card variant="glass" className="p-5">
            <p className="text-sm text-muted-foreground leading-relaxed">{guide.content.intro}</p>
          </Card>

          {/* Sections */}
          {guide.content.sections.map((section, index) => (
            <Card key={index} variant="default" className="p-5 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <h3 className="font-bold text-primary mb-3">{section.title}</h3>
              {section.text && (
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{section.text}</p>
              )}
              {section.steps && (
                <ul className="space-y-2">
                  {section.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                        {stepIndex + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-lg border-b border-border z-40 px-6 py-4">
        <h1 className="font-bold text-lg text-center">Guias</h1>
      </div>

      <div className="px-6 py-6 space-y-4">
        <p className="text-sm text-muted-foreground text-center mb-4">
          Guias completos para sua evolução
        </p>

        {guides.map((guide, index) => (
          <Card
            key={guide.id}
            className="overflow-hidden cursor-pointer transition-all duration-300 hover:border-primary/50 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => setSelectedGuide(guide.id)}
          >
            <div className="flex items-center gap-4 p-4">
              {guide.image ? (
                <img 
                  src={guide.image} 
                  alt={guide.title}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              ) : (
                <div className={`w-16 h-16 ${guide.bgColor} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                  <guide.icon className={`w-8 h-8 ${guide.color}`} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{guide.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{guide.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            </div>
          </Card>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
