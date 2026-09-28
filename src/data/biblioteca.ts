import { TextoFluencia } from '../types';

export const BIBLIOTECA_TEXTOS: TextoFluencia[] = [
  // =========================================================================
  // NÍVEL 1: MUITO FÁCIL (Alfabetização Inicial / 1º e 2º Ano)
  // Flesch: 88 a 96 | Frases curtas, palavras de alta frequência, sílabas simples
  // =========================================================================
  {
    id: 1,
    title: "O Gato Mimi",
    nivel: "Muito Fácil",
    cor: "teal",
    text: "Mimi é um gato fofo. Ele tem pelo branco e olhos azuis. O gato Mimi gosta de pular no sofá. Ele bebe leite em uma tigela bonita. Quando a noite chega, Mimi dorme no tapete macio. Todo mundo ama o gatinho Mimi.",
    syntacticText: "Mimi / é um gato fofo. Ele tem pelo branco / e olhos azuis. O gato Mimi / gosta de pular / no sofá. Ele bebe leite / em uma tigela bonita. Quando a noite chega, / Mimi dorme / no tapete macio. Todo mundo / ama o gatinho Mimi.",
    leiturabilidade: {
      flesch: 95,
      classificacao: "Muito Fácil",
      anoEscolar: "1º e 2º ano",
      palavras: 47,
      tempoLeituraSegundos: 24
    }
  },
  {
    id: 2,
    title: "O Pato Pepê",
    nivel: "Muito Fácil",
    cor: "teal",
    text: "Pepê é um pato amarelo. Ele nada alegre no lago da fazenda. Pepê bate as asas na água limpa. Ele come folhas verdes e sementes. Seus amigos patos nadam juntos em fila. No fim do dia, Pepê volta para o ninho quentinho.",
    syntacticText: "Pepê / é um pato amarelo. Ele nada alegre / no lago da fazenda. Pepê bate as asas / na água limpa. Ele come / folhas verdes / e sementes. Seus amigos patos / nadam juntos / em fila. No fim do dia, / Pepê volta / para o ninho quentinho.",
    leiturabilidade: {
      flesch: 93,
      classificacao: "Muito Fácil",
      anoEscolar: "1º e 2º ano",
      palavras: 46,
      tempoLeituraSegundos: 23
    }
  },
  {
    id: 3,
    title: "O Pipoca no Jardim",
    nivel: "Muito Fácil",
    cor: "teal",
    text: "Pipoca é um cachorrinho sapeca. Ele corre atrás da bola vermelha. A bola quica na grama verde do jardim. Pipoca pega a bola e leva para Ana. Ana faz carinho na cabeça do cãozinho. Pipoca balança o rabo todo feliz.",
    syntacticText: "Pipoca / é um cachorrinho sapeca. Ele corre / atrás da bola vermelha. A bola quica / na grama verde / do jardim. Pipoca pega a bola / e leva / para Ana. Ana faz carinho / na cabeça / do cãozinho. Pipoca balança o rabo / todo feliz.",
    leiturabilidade: {
      flesch: 91,
      classificacao: "Muito Fácil",
      anoEscolar: "1º e 2º ano",
      palavras: 43,
      tempoLeituraSegundos: 22
    }
  },
  {
    id: 4,
    title: "A Casa do Vovô",
    nivel: "Muito Fácil",
    cor: "teal",
    text: "A casa do vovô fica no campo. Lá tem uma mangueira bem alta cheia de frutas doces. Vovô colhe mangas maduras em uma cesta de palha. Nós comemos manga fresca na varanda. Os passarinhos cantam felizes nas árvores. É um lugar de muita paz e alegria.",
    syntacticText: "A casa do vovô / fica no campo. Lá tem uma mangueira / bem alta / cheia de frutas doces. Vovô colhe / mangas maduras / em uma cesta de palha. Nós comemos / manga fresca / na varanda. Os passarinhos / cantam felizes / nas árvores. É um lugar / de muita paz / e alegria.",
    leiturabilidade: {
      flesch: 89,
      classificacao: "Muito Fácil",
      anoEscolar: "1º e 2º ano",
      palavras: 48,
      tempoLeituraSegundos: 24
    }
  },
  {
    id: 5,
    title: "O Barquinho de Papel",
    nivel: "Muito Fácil",
    cor: "teal",
    text: "Lucas fez um barquinho de papel azul. Ele colocou o barquinho na água calma da bacia. O vento suave soprou as velinhas de papel. O barquinho navegou de um lado até o outro sem afundar. Lucas sorriu e bateu palmas de tanta emoção.",
    syntacticText: "Lucas fez / um barquinho / de papel azul. Ele colocou o barquinho / na água calma / da bacia. O vento suave / soprou as velinhas / de papel. O barquinho navegou / de um lado / até o outro / sem afundar. Lucas sorriu / e bateu palmas / de tanta emoção.",
    leiturabilidade: {
      flesch: 88,
      classificacao: "Muito Fácil",
      anoEscolar: "1º e 2º ano",
      palavras: 46,
      tempoLeituraSegundos: 23
    }
  },

  // =========================================================================
  // NÍVEL 2: FÁCIL (Consolidação da Leitura / 3º e 4º Ano)
  // Flesch: 76 a 87 | Períodos simples e compostos coordenados, vocabulário cotidiano
  // =========================================================================
  {
    id: 6,
    title: "A Raposa Esperta",
    nivel: "Fácil",
    cor: "teal",
    text: "A raposa é um animal mamífero muito esperto. Ela tem pelo alaranjado e uma cauda grande e peluda. As raposas vivem em tocas seguras que elas mesmas cavam no solo da floresta. Elas caçam pequenos animais durante a noite. A raposa come ratos, coelhos e frutas silvestres. Suas orelhas são pontudas e ajudam a ouvir qualquer barulho de longe.",
    syntacticText: "A raposa / é um animal mamífero / muito esperto. Ela tem pelo alaranjado / e uma cauda grande / e peluda. As raposas vivem / em tocas seguras / que elas mesmas cavam / no solo da floresta. Elas caçam / pequenos animais / durante a noite. A raposa come / ratos, coelhos / e frutas silvestres. Suas orelhas são pontudas / e ajudam a ouvir / qualquer barulho de longe.",
    leiturabilidade: {
      flesch: 83,
      classificacao: "Fácil",
      anoEscolar: "3º e 4º ano",
      palavras: 58,
      tempoLeituraSegundos: 29
    }
  },
  {
    id: 7,
    title: "Os Golfinhos Amigos",
    nivel: "Fácil",
    cor: "teal",
    text: "Os golfinhos são animais marinhos muito inteligentes e carinhosos. Eles respiram o mesmo ar que nós através de um orifício no alto da cabeça. Os golfinhos vivem em grupos unidos chamados cardumes. Eles se comunicam através de estalidos e assobios especiais. Golfinhos comem peixes e lulas frescas. Eles saltam sobre as ondas com muita agilidade.",
    syntacticText: "Os golfinhos / são animais marinhos / muito inteligentes e carinhosos. Eles respiram o mesmo ar / que nós / através de um orifício / no alto da cabeça. Os golfinhos vivem / em grupos unidos / chamados cardumes. Eles se comunicam / através de estalidos / e assobios especiais. Golfinhos comem / peixes / e lulas frescas. Eles saltam / sobre as ondas / com muita agilidade.",
    leiturabilidade: {
      flesch: 81,
      classificacao: "Fácil",
      anoEscolar: "3º e 4º ano",
      palavras: 57,
      tempoLeituraSegundos: 28
    }
  },
  {
    id: 8,
    title: "Luna e a Adoção de Mia",
    nivel: "Fácil",
    cor: "teal",
    text: "Luna ia caminhando para a casa de sua avó numa tarde ensolarada. No meio do caminho, ela ouviu um miado bem baixinho. Era um filhotinho de gato perto de uma caixa de papelão. O gato era todo preto, com as quatro patinhas brancas. Luna pegou o bichinho no colo com carinho. Ele começou a ronronar de alívio. A família acolheu o gatinho com amor e deu a ele o nome de Mia.",
    syntacticText: "Luna ia caminhando / para a casa de sua avó / numa tarde ensolarada. No meio do caminho, / ela ouviu / um miado bem baixinho. Era um filhotinho de gato / perto de uma caixa / de papelão. O gato era todo preto, / com as quatro patinhas / brancas. Luna pegou o bichinho / no colo / com carinho. Ele começou a ronronar / de alívio. A família acolheu o gatinho / com amor / e deu a ele / o nome de Mia.",
    leiturabilidade: {
      flesch: 80,
      classificacao: "Fácil",
      anoEscolar: "3º e 4º ano",
      palavras: 71,
      tempoLeituraSegundos: 35
    }
  },
  {
    id: 9,
    title: "Um Passeio no Zoológico",
    nivel: "Fácil",
    cor: "teal",
    text: "João visitou o zoológico da cidade com seus pais no domingo. O primeiro animal que viram foi a família de macacos travessos, que pulavam de galho em galho comendo bananas. Depois avistaram um leão imponente repousando sobre as pedras. Em seguida, os pinguins encantaram a todos nadando velozes na água gelada. No fim do passeio, João alimentou a girafa e voltou para casa muito feliz.",
    syntacticText: "João visitou / o zoológico da cidade / com seus pais no domingo. O primeiro animal que viram / foi a família / de macacos travessos, / que pulavam / de galho em galho / comendo bananas. Depois / avistaram um leão imponente / repousando sobre as pedras. Em seguida, / os pinguins / encantaram a todos / nadando velozes / na água gelada. No fim do passeio, / João alimentou a girafa / e voltou para casa / muito feliz.",
    leiturabilidade: {
      flesch: 78,
      classificacao: "Fácil",
      anoEscolar: "3º e 4º ano",
      palavras: 66,
      tempoLeituraSegundos: 33
    }
  },
  {
    id: 10,
    title: "As Abelhas Operárias",
    nivel: "Fácil",
    cor: "teal",
    text: "As abelhas são insetos fundamentais para a vida no planeta Terra. Dentro da colmeia organizada, cada abelha tem sua função bem definida. As abelhas operárias voam de flor em flor recolhendo néctar e pólen dourado. Ao fazerem isso, elas polinizam as plantas para que produzam frutos saborosos. Com o néctar das flores, as abelhas produzem o mel doce e saudável que nós consumimos.",
    syntacticText: "As abelhas / são insetos fundamentais / para a vida / no planeta Terra. Dentro da colmeia organizada, / cada abelha / tem sua função / bem definida. As abelhas operárias / voam de flor em flor / recolhendo néctar / e pólen dourado. Ao fazerem isso, / elas polinizam as plantas / para que produzam / frutos saborosos. Com o néctar das flores, / as abelhas produzem / o mel doce e saudável / que nós consumimos.",
    leiturabilidade: {
      flesch: 76,
      classificacao: "Fácil",
      anoEscolar: "3º e 4º ano",
      palavras: 65,
      tempoLeituraSegundos: 32
    }
  },

  // =========================================================================
  // NÍVEL 3: INTERMEDIÁRIO (Fluência Textual & Informativa / 5º e 6º Ano)
  // Flesch: 62 a 74 | Subordinação leve, vocabulário informativo, pontuação variada
  // =========================================================================
  {
    id: 11,
    title: "A Lua - Nosso Satélite Natural",
    nivel: "Intermediário",
    cor: "blue",
    text: "A Lua é o único satélite natural da Terra. Ela fica a mais de trezentos mil km de distância do nosso planeta. A Lua não tem luz própria e brilha porque reflete a luz do Sol. Ela demora aproximadamente vinte e sete dias para dar uma volta completa ao redor da Terra. Na superfície lunar não existe ar, água ou vida. Os astronautas da missão Apollo onze foram os primeiros humanos a pisar na Lua em mil novecentos e sessenta e nove.",
    syntacticText: "A Lua / é o único satélite natural / da Terra. Ela fica / a mais de trezentos mil km / de distância / do nosso planeta. A Lua / não tem luz própria / e brilha / porque reflete / a luz do Sol. Ela demora / aproximadamente vinte e sete dias / para dar uma volta completa / ao redor da Terra. Na superfície lunar / não existe / ar, água ou vida. Os astronautas / da missão Apollo onze / foram os primeiros humanos / a pisar na Lua / em mil novecentos / e sessenta e nove.",
    leiturabilidade: {
      flesch: 72,
      classificacao: "Intermediário",
      anoEscolar: "5º e 6º ano",
      palavras: 76,
      tempoLeituraSegundos: 38
    }
  },
  {
    id: 12,
    title: "O Sistema Solar",
    nivel: "Intermediário",
    cor: "blue",
    text: "O Sistema Solar é formado pelo Sol e todos os corpos celestes que giram ao seu redor. Existem oito planetas principais: Mercúrio, Vênus, Terra, Marte, Júpiter, Saturno, Urano e Netuno. O Sol é uma estrela gigantesca que fornece luz e calor indispensáveis para a manutenção da vida. Júpiter se destaca como o maior planeta de todos, enquanto Mercúrio é o menor e mais próximo do Sol. Além dos planetas, o sistema abriga luas fascinantes, asteroides e cometas brilhantes.",
    syntacticText: "O Sistema Solar / é formado pelo Sol / e todos os corpos celestes / que giram ao seu redor. Existem oito planetas principais: / Mercúrio, Vênus, / Terra, Marte, / Júpiter, Saturno, / Urano e Netuno. O Sol / é uma estrela gigantesca / que fornece luz e calor / indispensáveis / para a manutenção da vida. Júpiter se destaca / como o maior planeta de todos, / enquanto Mercúrio é o menor / e mais próximo do Sol. Além dos planetas, / o sistema abriga luas fascinantes, / asteroides / e cometas brilhantes.",
    leiturabilidade: {
      flesch: 70,
      classificacao: "Intermediário",
      anoEscolar: "5º e 6º ano",
      palavras: 77,
      tempoLeituraSegundos: 39
    }
  },
  {
    id: 13,
    title: "O Tamanduá-Bandeira e o Cerrado",
    nivel: "Intermediário",
    cor: "blue",
    text: "O tamanduá-bandeira é um mamífero típico da América do Sul, encontrado principalmente nas savanas do Cerrado brasileiro. Esse animal peculiar pode medir até 2 metros de comprimento, incluindo sua cauda longa e peluda. Sua principal característica biológica é o focinho alongado e a língua extensível que alcança sessenta centímetros. O tamanduá alimenta-se de formigas e cupins, consumindo até trinta mil insetos diariamente. Suas garras fortes abrem os ninhos sem destruir a colônia por completo.",
    syntacticText: "O tamanduá-bandeira / é um mamífero típico / da América do Sul, / encontrado principalmente / nas savanas do Cerrado brasileiro. Esse animal peculiar / pode medir / até 2 metros de comprimento, / incluindo sua cauda / longa e peluda. Sua principal característica biológica / é o focinho alongado / e a língua extensível / que alcança sessenta centímetros. O tamanduá alimenta-se / de formigas e cupins, / consumindo até / trinta mil insetos diariamente. Suas garras fortes / abrem os ninhos / sem destruir a colônia / por completo.",
    leiturabilidade: {
      flesch: 68,
      classificacao: "Intermediário",
      anoEscolar: "5º e 6º ano",
      palavras: 76,
      tempoLeituraSegundos: 38
    }
  },
  {
    id: 14,
    title: "Jogos e Tradições Indígenas",
    nivel: "Intermediário",
    cor: "blue",
    text: "Os povos originários do Brasil preservam uma rica tradição de jogos coletivos e brincadeiras esportivas. A peteca, por exemplo, foi criada pelos indígenas e atualmente encanta atletas em várias partes do país. Outro costume tradicional é a corrida de tora, onde grupos fortes carregam troncos pesados de palmeiras em trajetos desafiadores. As crianças indígenas praticam arco e flecha com precisão. Essas práticas corporais ensinam a união da comunidade e o profundo respeito com o meio ambiente.",
    syntacticText: "Os povos originários do Brasil / preservam uma rica tradição / de jogos coletivos / e brincadeiras esportivas. A peteca, por exemplo, / foi criada pelos indígenas / e atualmente encanta atletas / em várias partes do país. Outro costume tradicional / é a corrida de tora, / onde grupos fortes / carregam troncos pesados / de palmeiras / em trajetos desafiadores. As crianças indígenas / praticam arco e flecha com precisão. Essas práticas corporais / ensinam a união da comunidade / e o profundo respeito / com o meio ambiente.",
    leiturabilidade: {
      flesch: 67,
      classificacao: "Intermediário",
      anoEscolar: "5º e 6º ano",
      palavras: 74,
      tempoLeituraSegundos: 37
    }
  },
  {
    id: 15,
    title: "As Tartarugas Marinhas",
    nivel: "Intermediário",
    cor: "blue",
    text: "As tartarugas marinhas existem nos oceanos há mais de cem milhões de anos, convivendo inclusive na época dos dinossauros. Elas realizam viagens migratórias de milhares de quilômetros para desovar exatamente na praia onde nasceram. As fêmeas cavam ninhos profundos na areia quente e depositam cerca de cem ovos redondos. Quando os filhotes quebram a casca, correm com bravura em direção às ondas do mar para escapar dos predadores costeiros.",
    syntacticText: "As tartarugas marinhas / existem nos oceanos / há mais de cem milhões de anos, / convivendo inclusive / na época dos dinossauros. Elas realizam viagens migratórias / de milhares de quilômetros / para desovar / exatamente na praia / onde nasceram. As fêmeas / cavam ninhos profundos / na areia quente / e depositam cerca de cem ovos redondos. Quando os filhotes quebram a casca, / correm com bravura / em direção às ondas do mar / para escapar / dos predadores costeiros.",
    leiturabilidade: {
      flesch: 65,
      classificacao: "Intermediário",
      anoEscolar: "5º e 6º ano",
      palavras: 72,
      tempoLeituraSegundos: 36
    }
  },

  // =========================================================================
  // NÍVEL 4: AVANÇADO (Períodos Compostos & Vocabulário Rico / 7º ao 9º Ano)
  // Flesch: 48 a 59 | Orações subordinadas, dados históricos e científicos
  // =========================================================================
  {
    id: 16,
    title: "As Cordilheiras do Himalaia",
    nivel: "Avançado",
    cor: "purple",
    text: "O Himalaia é a cordilheira mais imponente do planeta, situada na Ásia e estendendo-se por cinco nações: Índia, Nepal, Butão, China e Paquistão. No coração dessa colossal muralha rochosa ergue-se o Monte Everest, o ponto culminante da Terra com seus oito mil oitocentos e quarenta e oito metros de altitude. O choque contínuo entre as placas tectônicas da Índia e da Eurásia foi responsável por moldar esses picos nevados ao longo de cinquenta milhões de anos. O ecossistema abriga raras espécies como o esquivo leopardo-das-neves.",
    syntacticText: "O Himalaia / é a cordilheira mais imponente do planeta, / situada na Ásia / e estendendo-se por cinco nações: / Índia, Nepal, Butão, / China e Paquistão. No coração / dessa colossal muralha rochosa / ergue-se o Monte Everest, / o ponto culminante da Terra / com seus oito mil oitocentos / e quarenta e oito metros / de altitude. O choque contínuo / entre as placas tectônicas / da Índia e da Eurásia / foi responsável / por moldar esses picos nevados / ao longo / de cinquenta milhões de anos. O ecossistema abriga / raras espécies / como o esquivo leopardo-das-neves.",
    leiturabilidade: {
      flesch: 56,
      classificacao: "Avançado",
      anoEscolar: "7º ao 9º ano",
      palavras: 80,
      tempoLeituraSegundos: 40
    }
  },
  {
    id: 17,
    title: "A Floresta Amazônica e o Clima",
    nivel: "Avançado",
    cor: "purple",
    text: "A Floresta Amazônica constitui o maior bioma tropical úmido da Terra, cobrindo uma extensão de cinco milhões e meio de quilômetros quadrados através de nove países sul-americanos. A bacia hidrográfica amazônica abriga o mais volumoso curso de água doce do planeta, além de concentrar a mais densa biodiversidade já catalogada pela ciência moderna. Os rios voadores, correntes de vapor suspensas originadas da transpiração das árvores frondosas, transportam chuvas torrenciais vitais para a agricultura e para a estabilidade térmica de todo o hemisfério sul.",
    syntacticText: "A Floresta Amazônica / constitui o maior bioma / tropical úmido da Terra, / cobrindo uma extensão / de cinco milhões e meio / de quilômetros quadrados / através de nove países / sul-americanos. A bacia hidrográfica amazônica / abriga o mais volumoso / curso de água doce / do planeta, / além de concentrar / a mais densa biodiversidade / já catalogada pela ciência moderna. Os rios voadores, / correntes de vapor suspensas / originadas da transpiração / das árvores frondosas, / transportam chuvas torrenciais / vitais para a agricultura / e para a estabilidade térmica / de todo o hemisfério sul.",
    leiturabilidade: {
      flesch: 52,
      classificacao: "Avançado",
      anoEscolar: "7º ao 9º ano",
      palavras: 78,
      tempoLeituraSegundos: 39
    }
  },
  {
    id: 18,
    title: "O Observatório do Deserto de Atacama",
    nivel: "Avançado",
    cor: "purple",
    text: "Localizado no altiplano setentrional do Chile, o Deserto do Atacama ostenta o título de região não polar mais árida de todo o globo terrestre. A combinação singular de altitudes elevadas, baixíssima umidade atmosférica e noites desprovidas de nebulosidade proporciona uma transparência ótica quase perfeita para o escrutínio do cosmos. Por essa razão estratégica, os maiores consórcios astronômicos internacionais instalaram ali o radiotelescópio ALMA, cujas gigantescas antenas parabólicas capturam sinais eletromagnéticos emitidos há bilhões de anos por galáxias primordiais.",
    syntacticText: "Localizado no altiplano setentrional do Chile, / o Deserto do Atacama / ostenta o título / de região não polar mais árida / de todo o globo terrestre. A combinação singular / de altitudes elevadas, / baixíssima umidade atmosférica / e noites desprovidas de nebulosidade / proporciona / uma transparência ótica quase perfeita / para o escrutínio do cosmos. Por essa razão estratégica, / os maiores consórcios astronômicos internacionais / instalaram ali o radiotelescópio ALMA, / cujas gigantescas antenas parabólicas / capturam sinais eletromagnéticos / emitidos há bilhões de anos / por galáxias primordiais.",
    leiturabilidade: {
      flesch: 50,
      classificacao: "Avançado",
      anoEscolar: "7º ao 9º ano",
      palavras: 77,
      tempoLeituraSegundos: 39
    }
  },
  {
    id: 19,
    title: "As Memórias do Diário do Bisavô",
    nivel: "Avançado",
    cor: "purple",
    text: "Nos manuscritos amarelados deixados por meu bisavô José, redigidos no Vale do Paraíba durante a segunda metade do século dezenove, transparece a complexidade de uma sociedade que caminhava a passos lentos rumo à abolição da escravatura. Suas reflexões revelavam inquietação moral perante a desumanidade imposta aos trabalhadores rurais nos cafezais fluminenses. Com a promulgação da Lei Áurea em mil oitocentos e oitenta e oito, o pioneirismo do bisavô manifestou-se na fundação da primeira escola comunitária da região.",
    syntacticText: "Nos manuscritos amarelados / deixados por meu bisavô José, / redigidos no Vale do Paraíba / durante a segunda metade / do século dezenove, / transparece a complexidade / de uma sociedade / que caminhava a passos lentos / rumo à abolição da escravatura. Suas reflexões / revelavam inquietação moral / perante a desumanidade imposta / aos trabalhadores rurais / nos cafezais fluminenses. Com a promulgação da Lei Áurea / em mil oitocentos e oitenta e oito, / o pioneirismo do bisavô / manifestou-se / na fundação da primeira escola comunitária / da região.",
    leiturabilidade: {
      flesch: 49,
      classificacao: "Avançado",
      anoEscolar: "7º ao 9º ano",
      palavras: 76,
      tempoLeituraSegundos: 38
    }
  },
  {
    id: 20,
    title: "A Dança das Marés Oceânicas",
    nivel: "Avançado",
    cor: "purple",
    text: "O movimento oscilatório das marés oceânicas é resultado direto da atração gravitacional combinada exercida pela Lua e pelo Sol sobre a massa líquida terrestre. Embora a massa do Sol seja incomparavelmente superior à da Lua, a proximidade do satélite faz com que seu gradiente de maré tenha o dobro da intensidade solar. Quando ambos os astros alinham-se nas fases de lua nova e cheia, ocorrem as chamadas marés de sizígia, caracterizadas por variações extremas entre o fluxo máximo e o refluxo.",
    syntacticText: "O movimento oscilatório / das marés oceânicas / é resultado direto / da atração gravitacional combinada / exercida pela Lua e pelo Sol / sobre a massa líquida terrestre. Embora a massa do Sol / seja incomparavelmente superior à da Lua, / a proximidade do satélite / faz com que seu gradiente de maré / tenha o dobro / da intensidade solar. Quando ambos os astros alinham-se / nas fases de lua nova e cheia, / ocorrem as chamadas marés de sizígia, / caracterizadas por variações extremas / entre o fluxo máximo / e o refluxo.",
    leiturabilidade: {
      flesch: 48,
      classificacao: "Avançado",
      anoEscolar: "7º ao 9º ano",
      palavras: 76,
      tempoLeituraSegundos: 38
    }
  },

  // =========================================================================
  // NÍVEL 5: ENSINO MÉDIO (Treino de Fluência, Prosódia e Ritmo / 14 a 18 Anos)
  // Flesch: 54 a 64 | Períodos expressivos, vocabulário instigante e acessível
  // Conteúdo moderno e equilibrado, focado em fluência sem barreira cognitiva
  // =========================================================================
  {
    id: 21,
    title: "A Ciência do Foco e a Era Digital",
    nivel: "Ensino Médio",
    cor: "rose",
    text: "Manter a concentração profunda tornou-se um dos maiores desafios da vida moderna, especialmente com o fluxo contínuo de notificações nos celulares. Pesquisas recentes em neurociência mostram que o cérebro humano não foi programado para realizar várias tarefas complexas ao mesmo tempo. Quando alternamos rapidamente entre aplicativos e mensagens, perdemos energia mental preciosa e diminuímos nosso rendimento. Treinar a leitura atenta de textos contínuos funciona como uma verdadeira academia para a mente, fortalecendo a memória de trabalho e restaurando a nossa capacidade de reflexão crítica.",
    syntacticText: "Manter a concentração profunda / tornou-se um dos maiores desafios / da vida moderna, / especialmente com o fluxo contínuo / de notificações nos celulares. Pesquisas recentes em neurociência / mostram / que o cérebro humano / não foi programado / para realizar várias tarefas complexas / ao mesmo tempo. Quando alternamos rapidamente / entre aplicativos e mensagens, / perdemos energia mental preciosa / e diminuímos nosso rendimento. Treinar a leitura atenta / de textos contínuos / funciona como uma verdadeira academia / para a mente, / fortalecendo a memória de trabalho / e restaurando a nossa capacidade / de reflexão crítica.",
    leiturabilidade: {
      flesch: 58,
      classificacao: "Ensino Médio",
      anoEscolar: "Ensino Médio",
      palavras: 86,
      tempoLeituraSegundos: 43
    }
  },
  {
    id: 22,
    title: "O Despertador e as Manhãs de Chuva",
    nivel: "Ensino Médio",
    cor: "rose",
    text: "O som estridente do despertador às seis da manhã raramente é bem-vindo, sobretudo em uma terça-feira cinzenta de chuva fina lá fora. Sob o cobertor macio, o tempo parece desacelerar, convidando a mente a negociar cinco minutos adicionais de repouso. Contudo, vencer a inércia matinal traz uma recompensa silenciosa: o aroma do café recém-coado na cozinha, o vapor quente da caneca entre as mãos e a oportunidade de observar a cidade que desperta gradualmente. A rotina escolar pode ser exigente, mas é também o espaço onde amizades sinceras ganham vida.",
    syntacticText: "O som estridente do despertador / às seis da manhã / raramente é bem-vindo, / sobretudo em uma terça-feira cinzenta / de chuva fina lá fora. Sob o cobertor macio, / o tempo parece desacelerar, / convidando a mente / a negociar cinco minutos adicionais / de repouso. Contudo, / vencer a inércia matinal / traz uma recompensa silenciosa: / o aroma do café recém-coado / na cozinha, / o vapor quente da caneca / entre as mãos / e a oportunidade de observar a cidade / que desperta gradualmente. A rotina escolar / pode ser exigente, / mas é também o espaço / onde amizades sinceras / ganham vida.",
    leiturabilidade: {
      flesch: 62,
      classificacao: "Ensino Médio",
      anoEscolar: "Ensino Médio",
      palavras: 84,
      tempoLeituraSegundos: 42
    }
  },
  {
    id: 23,
    title: "A Busca por Mundos Habitáveis",
    nivel: "Ensino Médio",
    cor: "rose",
    text: "Durante séculos, os astrônomos observavam o céu noturno imaginando se existiriam outros planetas orbitando estrelas distantes além do Sol. Hoje, graças aos telescópios espaciais de alta precisão, a humanidade já descobriu milhares de exoplanetas em nossa própria galáxia. Alguns desses mundos distantes orbitam a chamada zona habitável, uma distância equilibrada que permite a existência de água líquida na superfície. Analisar as atmosferas desses corpos celestes é o próximo passo audacioso da astrobiologia, alimentando a antiga curiosidade sobre a possibilidade de vida no universo.",
    syntacticText: "Durante séculos, / os astrônomos observavam o céu noturno / imaginando se existiriam outros planetas / orbitando estrelas distantes / além do Sol. Hoje, / graças aos telescópios espaciais / de alta precisão, / a humanidade já descobriu / milhares de exoplanetas / em nossa própria galáxia. Alguns desses mundos distantes / orbitam a chamada zona habitável, / uma distância equilibrada / que permite a existência / de água líquida na superfície. Analisar as atmosferas / desses corpos celestes / é o próximo passo audacioso / da astrobiologia, / alimentando a antiga curiosidade / sobre a possibilidade / de vida no universo.",
    leiturabilidade: {
      flesch: 57,
      classificacao: "Ensino Médio",
      anoEscolar: "Ensino Médio",
      palavras: 79,
      tempoLeituraSegundos: 40
    }
  },
  {
    id: 24,
    title: "A Inteligência Artificial e a Criatividade",
    nivel: "Ensino Médio",
    cor: "rose",
    text: "A rápida expansão dos algoritmos inteligentes tem transformado a maneira como produzimos imagens, compomos músicas e estruturamos ideias cotidianas. No entanto, longe de substituir a sensibilidade humana, essas ferramentas tecnológicas funcionam como amplificadores do nosso potencial criativo. Uma máquina é capaz de processar volumes monumentais de informações em frações de segundo, mas a interpretação emocional e a originalidade continuam sendo traços genuinamente humanos. No ambiente dos estudos e do trabalho futuro, a cooperação entre inteligência artificial e raciocínio crítico será a habilidade mais valorizada.",
    syntacticText: "A rápida expansão / dos algoritmos inteligentes / tem transformado a maneira / como produzimos imagens, / compomos músicas / e estruturamos ideias cotidianas. No entanto, / longe de substituir a sensibilidade humana, / essas ferramentas tecnológicas funcionam / como amplificadores / do nosso potencial criativo. Uma máquina é capaz / de processar volumes monumentais / de informações / em frações de segundo, / mas a interpretação emocional / e a originalidade / continuam sendo traços / genuinamente humanos. No ambiente dos estudos / e do trabalho futuro, / a cooperação / entre inteligência artificial / e raciocínio crítico / será a habilidade / mais valorizada.",
    leiturabilidade: {
      flesch: 54,
      classificacao: "Ensino Médio",
      anoEscolar: "Ensino Médio",
      palavras: 84,
      tempoLeituraSegundos: 42
    }
  },
  {
    id: 25,
    title: "O Poder do Ritmo e da Poesia Urbana",
    nivel: "Ensino Médio",
    cor: "rose",
    text: "Nas praças centrais das grandes capitais, jovens poetas reúnem-se ao entardecer para duelos de rimas conhecidos como batalhas de rap e saraus. Nesses encontros vibrantes, a palavra falada ganha uma força extraordinária por meio do ritmo, das aliterações e da cadência das pausas. Quem domina a métrica e a entonação consegue prender a atenção do público do primeiro ao último verso. Essa tradição contemporânea reafirma que a linguagem não é apenas um código rígido nas páginas dos livros, mas uma arte viva que conecta pessoas e expressa sentimentos profundos.",
    syntacticText: "Nas praças centrais / das grandes capitais, / jovens poetas reúnem-se ao entardecer / para duelos de rimas / conhecidos como batalhas de rap / e saraus. Nesses encontros vibrantes, / a palavra falada / ganha uma força extraordinária / por meio do ritmo, / das aliterações / e da cadência das pausas. Quem domina a métrica / e a entonação / consegue prender a atenção / do público / do primeiro ao último verso. Essa tradição contemporânea / reafirma / que a linguagem não é apenas / um código rígido / nas páginas dos livros, / mas uma arte viva / que conecta pessoas / e expressa sentimentos profundos.",
    leiturabilidade: {
      flesch: 59,
      classificacao: "Ensino Médio",
      anoEscolar: "Ensino Médio",
      palavras: 83,
      tempoLeituraSegundos: 41
    }
  }
];

