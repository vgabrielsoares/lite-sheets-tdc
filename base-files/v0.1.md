# MVP 1 - Ficha Personalizada

A primeira versão do projeto deve possibilitar a listagem de fichas, criação de fichas a partir do zero, edição de fichas criadas, persistência local das fichas e rolagem de testes de habilidade e dano simples.

## Funcionalidades

### Listagem de Fichas

No MVP 1, a tela inicial será a lista de fichas do usuário. Caso não haja nenhuma ficha, no lugar de onde teria uma, deve ter um prompt para criar uma nova ficha, que leva para outra página.
As fichas devem ter informações básicas do personagem, como o nome, nível, linhagem e origem.

### Criação de Fichas

No MVP 1, não criaremos as informações do RPG ainda. No futuro, o usuário vai poder escolher todas as opções presentes do livro, e seus valores, ganhos e penalidades vão ser aplicados automaticamente na ficha.

#### Ganhos de Nível 1

Nesse MVP, a ficha será criada em branco, com todos os campos com possibilidade de edição. Na criação, deve-se informar apenas o nome do personagem e então a ficha vai ser criada em branco com as seguintes informações preenchidas (padrão do RPG):

- 15 PV (pontos de vida) máximo e atual
- 2 PP (pontos de poder) máximo e atual

- Proficiência com Armas Simples

- Atributos (Agilidade, Constituição, Força, Influência, Mente e Presença) em 1

- Idioma Comum conhecido + um número de idiomas igual ao valor do atributo Mente -1 (mínimo de 0 (retroativo, caso o valor do atributo aumente futuramente)). os idiomas são: Comum, Anão, Élfico, Goblinoide, Dracônico, Infernal, Primordial, Rúnico, Aquático, Gigante, Gnômico, Glasnee, Orc e Silvestre.

- Habilidade de Assinatura (uma habilidade que o jogador escolhe. essa habilidade ganha um bônus nos testes igual ao nível do personagem. habilidades de combate ganham esse bônus dividido por 3 (mínimo de 1))

- Inventário com uma Mochila, um Cartão do Banco e 10 PO$ (dinheiro)

#### Espaços da Ficha

Mas a ficha deverá ter vários espaços em branco para o usuário preencher, como:

- Conceito (Área com duas ou três frases de apanhado geral do personagem)

  - Quando clicar no conceito, abrir uma side bar retrátil com opção de fazer um texto maior sobre o conceito

- Origem (Só o nome da origem)

  - Quando clicar na origem, abrir uma side bar retrátil com a opção de preencher as proficiências com habilidades (duas), os atributos (+1 em um, ou +1 em dois e -1 em um) e habilidade especial (com espaço pra nome e descrição da habilidade) ganha com a origem

- Linhagem (Só o nome da linhagem)

  - Quando clicar na linhagem, abrir uma side bar retrátil com a opção de preencher os atributos (+1 em um, ou +1 em dois e -1 em um), tamanho e altura, peso em kg e na medida 'peso' (medida do RPG), idade, idiomas ganhos, deslocamento (podendo ser Andando, Voando, Escalando, Escavando ou Nadando), modificador de sentidos aguçados (podendo ser Visão, Olfato ou Audição, que é adicionado diretamente aos usos Observar, Farejar e Ouvir da Habilidade Percepção), visão (se é visão normal, na penumbra ou no escuro), lista de características de ancestralidade (contam como habilidade especial (com espaço pra nome e descrição da habilidade)) ganha com a linhagem

- Atributos (o valor numérico de cada atributo (Agilidade, Constituição, Força, Influência, Mente e Presença, três corporais, três mentais), geralmente indo de 0 a 5, mas podendo superar esse limite (para mais) em casos especiais)

  - Quando clicar em cada atributo, abrir uma side bar retrátil com uma descrição básica de cada atributo e as habilidades que tem ele como atributo-chave. As descrições são:
    - Agilidade: "A agilidade mede a destreza manual e física, reflexos, coordenação motora, flexibilidade e rapidez. A agilidade é geralmente o foco de personagens com muita rapidez e coordenação. Ladinos, ladrões, esgrimistas, artistas e variantes usam a agilidade. Ela influencia no número total da defesa das criaturas e nos ataques à distância. O atributo também pode ser usado em armas corpo a corpo com as propriedades ideais, em testes de destreza, acrobacia, furtividade e outros."
    - Constituição: "A constituição mede a composição física de uma criatura, sua saúde e bem-estar, resistência. A constituição geralmente é o foco de personagens com alta resistência e resiliência a diversas situações difíceis. Combatentes, personagens focados na proteção e defesa e variantes usam a constituição. Ela influencia nos PV de uma criatura. O atributo também é usado em testes de vigor, testes de resistência contra efeitos e outros."
    - Força: "A força mede as capacidades físicas dos músculos, atletismo. O atributo força é usado quando o poder físico de uma criatura é testado. A força é geralmente o foco de personagens que querem triunfar em combates a curta distância com dominância esmagadora. Guerreiros, Artistas Marciais, Gladiadores e variantes usam a força. Ela influencia na quantidade de peso que um personagem pode carregar e no dano causado por armas corpo a corpo. O atributo também é usado em testes de atletismo, luta, empurrar objetos, quebrar materiais e outros."
    - Influência: "A influência diz respeito às habilidades sociais de uma criatura e seu carisma. A influência é geralmente o foco de personagens carismáticos e sociáveis, que usam a lábia para substituir ações. Músicos, líderes, bardos e variantes usam a influência. Ela atua na capacidade de mudar a opinião de outras pessoas. O atributo também é usado em testes de persuasão, enganação, intimidação e outros."
    - Mente: "A mente diz respeito à inteligência, raciocínio lógico, capacidade de armazenar informações e conhecimentos. A mente é geralmente o foco de personagens cultos e estudiosos, usando a própria psique para superar obstáculos. Acadêmicos, feiticeiros, conhecedores e variantes usam a mente. Ela influencia na quantidade de habilidades de um personagem e na capacidade de aprendizado de feitiços. O atributo também é usado em testes de memorização, conhecimentos, o arcano, arte, investigação, tática e outros."
    - Presença: "A presença diz respeito aos sentidos naturais, capacidades mágicas e resiliência mental. A presença geralmente é o foco de personagens ligados à natureza, à magia, aqueles atentos ao mundo ao seu redor e suas mudanças. Feiticeiros, naturais, religiosos e variantes usam a presença. Ela influencia nos PP de uma criatura e seu poder mágico. O atributo também é usado em testes de feitiços, percepção, religião, determinação e outros."
  - As habilidades com o atributo-chave devem ser listadas a partir da própria ficha. Apesar de cada habilidade ter um atributo-chave padrão, o jogador poderá alterar o atributo-chave em alguns casos.

- Arquétipos: Os arquétipos são seis, e cada personagem pode ter qualquer um desses arquétipos, sem restrição. Então é interessante que essa seção tenha espaço para todos os seis arquétipos caso necessário. Os arquétipos são:

  - Acadêmico: O Acadêmico é um intelectual que usa a inteligência para resolver problemas e se especializar. Também pode ser extremamente versátil em vários assuntos.
  - Acólito: O Acólito faz uso de poder divino, geralmente ‘pegando emprestado’ energia de alguma divindade, seja ela negativa ou positiva. Sua fé e devoção devem ser as principais fontes de suas habilidades.
  - Combatente: O Combatente, como o nome sugere, se especializa em combates. Eles brilham tanto na ofensiva quanto na defesa, mas não têm tantas ferramentas que ajudem fora disso.
  - Feiticeiro: O Feiticeiro usa magia em forma de feitiços. Seus feitiços podem ser muito versáteis para diversas situações, frequentemente vistos como canhões de vidro frágeis e muito poderosos.
  - Ladino: O Ladino é ágil e sagaz, utilizando sua destreza e agilidade para sair de encrencas e resolver problemas. Versátil, um ladino pode se dar bem em qualquer situação adversa.
  - Natural: O Natural explora seu contato com a natureza, às vezes voltando para seu lado primal e animalesco, virando um com o meio ambiente.
    Cada arquétipo tem alguns ganhos específicos para cada tipo:
    - PV por nível (5 + Constituição para Combatente, 4 + Constituição para Ladino, 3 + Constituição para Natural e Acólito, 2 + Constituição para Acadêmico e 1 + Constituição para Feiticeiro)
    - PP por nível (1 + Presença para Combatente, 2 + Presença para Ladino, 3 + Presença para Natural e Acólito, 4 + Presença para Acadêmico e 5 + Presença para Feiticeiro)
    - Proficiência com Habilidade (duas habilidades iniciais por arquétipo)
    - Proficiências (Ferramentas, Armas, Armaduras)
    - Defesa por Etapa (Níveis 5, 10 e 15)
    - Características de Arquétipo (Habilidades Especiais) nos níveis 1, 5, 10 e 15
    - Poder de Arquétipo (Habilidades Especiais) nos níveis 2, 4, 6, 8, 9, 11, 13 e 14
    - Competências (Habilidades Especiais maiores) nos níveis 3, 7 e 12
    - Aumento de Atributo (aumenta um atributo em +1) nos níveis 4, 8 e 13
      Os ganhos por nível refletem no nível do arquétipo, e não no nível total do personagem. Ou seja, um personagem nível 5 que tenha 3 níveis de Combatente e 2 níveis de Feiticeiro, vai ganhar os benefícios de PV, PP e proficiências como se fosse um Combatente nível 3 e Feiticeiro nível 2.

- Habilidades: São 33 habilidades no total, e cada personagem ganha proficiência com habilidades igual a 3 + o valor do atributo Mente (retroativo, caso o atributo aumente futuramente). Ganhar proficiência significa sair do grau Leigo e passar a ser Adepto.

- Equipamentos: Espaço de inventário para listar quantos equipamentos e itens o personagem quiser (e puder carregar). Cada equipamento deve ter um nome, quantidade e peso. Ao clicar em um equipamento ou item específico, uma side bar retrátil deve abrir para permitir adição de descrição e detalhes do item.

Todos esses modificadores devem ser aplicados na ficha. Ou seja, ao clicar para 'expandir' uma seção da ficha, você pode adicionar o que aquela parte garante ao personagem, e esses valores são aplicados diretamente na ficha, calculados automaticamente.

### Visualização de Ficha

A ficha é grande e complexa, possuindo vários espaços diferentes. É preciso organizar bem a visualização e distribuição da ficha e suas informações.
Para não ficar uma página muito longa, é interessante dividir a ficha em várias abas ou seções, que podem ser acessadas por um menu lateral ou superior.

Também é interessante que a ficha em si fique ligeiramente alinhado a um dos lados da tela (personalizável) e que o espaço a mais no lado oposto seja ocupado pela side bar retrátil que abre ao clicar em qualquer campo da ficha, para detalhar mais aquele campo específico. Essa side bar vai estar presente em diversos lugares da ficha, detalhando a maior parte dos campos.

#### Página Inicial e Padrão

Nessa página deve ser exibido as principais informações da ficha, que o jogador vai precisar consultar com mais frequência.

##### Stats Básicos

- Nome do Personagem
- Nome do Jogador
- Linhagem do Personagem
- Origem do Personagem

- PV Atual / Máximo / Temporário
- PP Atual / Máximo / Temporário

- Nível do Personagem
- Nível de cada Arquétipo

- Experiência (XP) do Personagem

- Deslocamento Andando (padrão) / Voando / Escalando / Escavando / Nadando

- Defesa (padrão 15 + Agilidade)

  - Bônus de Armadura
    - Limite de Agilidade (se houver (o máximo de bônus de agilidade que pode ser aplicado à defesa, limitado pela armadura))
  - Outros Bônus de Defesa

- Tamanho do Personagem ("Tamanho" sendo uma medida especial do RPG com vários ganhos e penalidades). O tamanho influencia em:
  - Alcance
  - Modificador de Dano corpo-a-corpo
  - Modificador de Defesa
  - Quadrados Ocupados
  - Modificador de Peso Carregável
  - Modificador de Manobras de Combate
  - Modificador de ND de Rastreio do Personagem
  - Modificador de Acrobacia (Habilidade)
  - Modificador de Atletismo (Habilidade)
  - Modificador de Furtividade (Habilidade)
  - Modificador de Reflexos (Habilidade)
  - Modificador de Tenacidade (Habilidade)
- Todos esses dados modificadores por Tamanho ficam "escondidos", mas aplicados e calculados na ficha. Os valores são exibidos na sidebar retrátil ao clicar no Tamanho do personagem.

##### Atributos e Habilidades

- Valor de cada Atributo (Agilidade, Constituição, Força, Influência, Mente e Presença)

- Nível de Sorte

- Sentidos (Normais ou Aguçados)

- Nível de Sorte (nível e valor total)

- Habilidade de Assinatura

- Ofícios (Competências)

  - Níveis de 0 a 5
  - Atributo-chave
  - Outros Modificadores
  - Modificador Total (Atributo-chave \* (se nível 1 ou 2, multiplicado por 1; se nível 3 ou 4, multiplicado por 2; se nível 5, multiplicado por 3) + Outros Modificadores)

- Habilidades
  - Lista de Habilidades, que são:
    - Acerto
    - Acrobacia
    - Adestramento
    - Arcano
    - Arte
    - Atletismo
    - Condução
    - Destreza
    - Determinação
    - Enganação
    - Estratégia
    - Furtividade
    - História
    - Iniciativa
    - Instrução
    - Intimidação
    - Investigação
    - Luta
    - Medicina
    - Natureza
    - Ofício
    - Percepção
    - Performance
    - Perspicácia
    - Persuasão
    - Rastreamento
    - Reflexo
    - Religião
    - Sobrevivência
    - Sociedade
    - Sorte
    - Tenacidade
    - Vigor
  - Atributo-chave padrão (fixo e apagado para referência)
  - Modificador de dados (adição ou subtração de dados na rolagem. por exemplo, se a rolagem fosse serr 2d20+2, caso tenha +1 no modificador de dados, ela se tornaria 3d20+2)
  - Atributo-chave atual (o que de fato vai ser usado na rolagem e no cálculo, podendeo ser alterado pelo jogador)
  - Grau de Habilidade (Leigo (x0), Adepto (x1), Versado (x2), Mestre (x3))
  - Modificadores Temporários
  - Outros Modificadores
  - Modificador Total (Atributo-chave atual \* Grau de Habilidade + Modificadores Temporários + Outros Modificadores)
  - Rolagem Final (número de d20 igual ao atributo-chave atual + modificador de dados, somando o modificador total, ou seja, xd20 + y (podendo ser negativo, tanto os dados quanto os modificadores))

##### Combate

- PV Atual / Máximo / Temporário
- PP Atual / Máximo / Temporário
- Rodadas Máximas no Estado Morrendo (2 + Constituição + Outros Modificadores)
- Rodadas Atuais no Estado Morrendo
- Limite de PP por Rodada (Nível do Personagem + Valor de Presença + Outros Modificadores)

- Defesa (padrão 15 + Agilidade)

  - Bônus de Armadura
    - Limite de Agilidade (se houver (o máximo de bônus de agilidade que pode ser aplicado à defesa, limitado pela armadura))
  - Outros Bônus de Defesa

- Resistências

  - Imunidade a Condições
  - RD (redução de dano) a tipos de dano
  - Resistência Aprimorada a tipos de dano
  - Vulnerabilidade a tipos de dano

- Economia de Ações (se estão disponíveis ou não)

  - Ação Maior
  - Duas Ações Menores
  - Reação
  - Reação Defensiva
  - Ações Livres Infinitas
  - Botão para resetar a economia de ações no início do turno, ou as Reações no início da rodada

- Ataques

  - Rolagem de Ataque
    - Nome do Ataque
    - Atributo-chave
    - Habilidade Usada (Entre Acerto, Arcano, Luta, Natureza, Religião ou outra Habilidade personalizada pelo jogador exclusiva pelo personagem)
    - Bônus de Dados
    - Bônus de Modificador
    - Rolagem Final (número de d20 igual ao atributo-chave + bônus de dados, somando o bônus de modificador, ou seja, xd20 + y (podendo ser negativo, tanto os dados quanto os modificadores))
    - Alcance de Ataque (Entre Adjacente, Toque, Curto, Médio, Longo, Muito Longo ou um valor numérico personalizado pelo jogador)
  - Dano de Ataque
    - Dado de Dano (Ex: 1d6, 2d8, 3d10)
    - Bônus de Dano
    - Crítico (no modelo 20/+1d, por exemplo. (x/+yd))
    - Dano Total (dado de dano + bônus de dano)
    - Custo do ataque (em PP, se houver)

- Testes de Resistência
  - Valor das Habilidades de Determinação (Mente), Reflexo (Agilidade), Tenacidade (Força) e Vigor (Constituição)

#### Arquétipos e Classes

##### Arquétipos

- Nível de cada Arquétipo e nível total do personagem

- Características de Arquétipo de Nível 1, 5, 10 e 15 (mostrar apenas as características já adquiridas pelo personagem)

- Campo de escolhas permanentes ou temporárias dentro dos ganhos dos arquétipos

##### Classes

- Nível de cada Classe

  - Cada personagem só pode ter até no máximo 3 classes diferentes
  - O total da soma dos níveis das classes não pode ultrapassar o nível total do personagem

- Habilidades de Classe de Nível 1, 5, 10 e 15

- Melhorias de Habilidade de Classe 1, 2 e 3 dos níveis 7, 9 e 14

- Defesa por Etapa dos níveis 5, 10 e 15 (substituir a defesa por etapa padrão dos arquétipos por essa defesa quando o personagem atingir esses níveis)

- Ganhos por Classe (geralmente Proficiências, como proficiência com habilidades, armas, ferramentas)

- Escolhas permanentes ou temporárias dentro dos ganhos das classes

##### Progressão de Personagem

- Ganhos do personagem por nível
  - O padrão ser do nível 1 ao 15, mas podendo expandir do 16 ao 30, e até mesmo 31+ caso o jogador queir

#### Recursos

##### Habilidades Especiais

- Lista de Habilidades Especiais com nome, custo, e início da descrição limitada
  - Quando clicar na habilidade especial, abrir uma side bar retrátil com a descrição completa da habilidade especial

##### Proficiências

- Lista de Proficiências dividas por categoria
  - Armas
  - Proteções
  - Ferramentas
  - Outros

##### Idiomas

- Lista dos Idiomas e Alfabetos conhecidos

##### Descanso

- Cálculo de recuperação de PV e PP em um descanso
  - Para a ação de Dormir, a recuperação é igual a Nível do Personagem \* o valor de Constituição + Outros Modificadores
  - Para a ação de Meditar, a recuperação é igual a Nível do Personagem \* o valor de Presença + Outros Modificadores
  - O resultado final é a soma, mas depende da condição/nível do descanso
    - Caso seja Precário multiplica por 0.5
    - Caso seja Normal multiplica por 1
    - Caso seja Confortável multiplica por 1.5
    - Caso seja Abastado multiplica por 2.5
    - Caso seja Abastado 2 multiplica por 3
    - Caso seja Abastado 3 Multiplica por 3.5
    - Caso seja Abastado 4 multiplica por 4
    - Caso seja Abastado 5 multiplica por 4.5

##### Particularidades

Características para detalhar melhor o personagem, como ele se comporta, seus pontos positivos e negativos.
Cada particularidade deve ter um título e descrição. No caso das características complementares, terem um modificador positivo ou negativo para fazer o balanço das características.

###### Características Complementares

Características com pontos positivos e negativos. O personagem deve sempre ter o equilíbrio de 0 pontos de particularidades complementares.
A ideia é que o personagem possa pegar algumas particularidades negativas, ganhando desvantagens, e então equilibrar com particularidades positivas.
Dividir entre as características negativas e positivas.

###### Características Completas

Características completas e já balanceadas.

#### Inventário

##### Riquezas

###### Cunhagem

- Divisão entre o dinheiro que o personagem tem fisicamente com ele (moedas) e o dinheiro que ele tem no banco (cartão do banco)
  - Ou seja, divisão entre "Físico" e "Banco"
- As moedas são:
  - Chama de Cobre (C$)
  - Íris de Ouro (PO$)
  - Estrela de Platina (PP$)

###### Riquezas Totais (Cada)

- Cálculo do total de riquezas do personagem, somando o dinheiro físico com o dinheiro no banco, e seu valor convertido para cada moeda
  - Total em C$
  - Total em PO$
  - Total em PP$

###### Conversor de Moedas

- Conversor entre as moedas, considerando as seguintes taxas:
  - 100 C$ = 1 PO$
  - 1 PO$ = 100 C$
  - 1 PP$ = 1000 PO$
  - 1000 PO$ = 1 PP$

##### Inventário de Itens

- Capacidade de Carga do Personagem (5+(Força \* 5)+ Outros Modificadores). Esse valor usa a medida "Peso" do RPG
- Carga Atual (soma do Peso de todos os itens carregados (Peso \* Quantidade))

- Sinalizador do Peso em Moedas (Cada 100 moedas físicas (sem ser no banco) contam como 1 de peso na capacidade de carga)

- Estado de Carga com Título e Sinalizador de Cor

  - Normal (Carregando até a capacidade de carga)
  - Sobrecarregado (Carregando até o dobro da capacidade de carga, mas fica Sobrecarregado (Condição))
  - Imobilizado (Carregando mais do que o dobro da capacidade de carga, não podendo se mover)

- Listagem de Itens

  - Nome
  - Quantidade
  - Peso (por item (podendo ser nenhum (sem peso, representado por vazio, " " ou "-"), peso 0 (representado por "0"), peso 1 ("1") ou mais, mas sempre inteiro))
  - Peso Total (multiplicação da Quantidade pelo peso (5 itens de peso 0 equivalem a peso 1, itens de peso de 1 ou mais, pesam a mesma quantidade do número))
    - Itens diferentes de peso 0 contam na soma para formar peso 1. Por exemplo, se houverem três itens A de peso 0 e dois itens B de peso 0, o personagem vai ter peso 1 na carga atual.
  - Ao clicar no item, abrir um side bar retrátil onde é possível detalhar a fundo toda a descrição física e mecânica do item

- Indicador de quanto peso o personagem consegue Empurrar e Levantar
  - O peso que o personagem pode empurrar é igual ao dobro da Capacidade de Carga Total do personagem
  - O peso que o personagem pode levantar é igual a metade da Capacidade de Carga Total do personagem

#### Descrições e Detalhes

- Campos pequenos de só algumas palavras e frases para:

  - Nome do Personagem
  - Gênero
  - Pronomes
  - Idade
  - Altura
  - Peso
  - Tamanho
  - Fé

- Seção de Descrição de Aparência
  - Pele
  - Olhos
  - Cabelos
  - Outros

##### Conceito de Personagem

Um texto de uma ou duas frases que define o personagem ou elucida seus objetivos.

##### Definidores do Personagem

Campos para detalhar mais sobre quem é o personagem e como ele se comporta. Entre eles:

- Falhas
- Medos
- Ideais
- Traços
- Objetivos
- Aliados
- Organizações

##### História

Um grande campo de texto para detalhar o background e história do personagem.

##### Anotações

Uma enorme seção de anotações livres, onde o jogador pode escrever o que quiser, como lembretes, detalhes do mundo, missões, etc.
É interessante que hajam formas de classificação e organização das anotações, como tags, páginas, categorias, etc.
Também é interessante que as anotações possam ser pesquisadas.
É importante que as anotações possam ser acessadas facilmente na ficha, em várias seções diferentes.

#### Feitiços

##### Dashboard dos Feitiços

- Número de feitiços conhecidos pelo personagem (com campo de modificador)

- Limite de PP por rodada (já disponível em outra seção da ficha, importante modularizar)
- PP atuais

- ND (Nível de Dificuldade) dos feitiços conjurados pelo personagem, separados por tipo

  - Feitiços Arcanos tem ND calculada como: 12 + Presença + Arcano (Habilidade) + Bônus de ND
  - Feitiços Naturais tem ND calculada como: 12 + Presença + Natureza (Habilidade) + Bônus de ND
  - Feitiços Religiosos tem ND calculada como: 12 + Presença + Religião (Habilidade) + Bônus de ND

- Bônus de Ataque de Feitiços conjurados pelo personagem, separados por tipo
  - Feitiços Arcanos tem Bônus de Ataque calculada como: Presença + Arcano (Habilidade) + Bônus de Ataque
  - Feitiços Naturais tem Bônus de Ataque calculada como: Presença + Natureza (Habilidade) + Bônus de Ataque
  - Feitiços Religiosos tem Bônus de Ataque calculada como: Presença + Religião (Habilidade) + Bônus de Ataque

É importante que haja a opção de personalizar a Habilidade de Conjuração para os cálculos de ND e Bônus de Ataque, mas o atributo é sempre Presença.

##### Lista de Feitiços

A lista de feitiços conhecidos pelo personagem, separados por círculo (do 1 ao 8).
Os feitiços tem os seguintes campos:

- Nome do Feitiço
- Resistência (Se houver)
- Tempo de Conjuração
- Alcance
- Alvo/Área
- Componentes
- Duração
- Classes de Feitiço
- Matriz de Feitiço
- Habilidade de Conjuração
- Descrição do Feitiço
- Aprimoramentos de Feitiço
- Elevação de Feitiço
- Anotações personalizadas sobre o feitiço

Como são muitas informações, é interessante que a lista de feitiços mostre apenas o nome do feitiço, talvez com a Matriz, Classes e Habilidade de Conjuração também, e ao clicar nele abra uma side bar retrátil com todas as outras informações.

##### Infos dos Feitiços

Tabela do Custo em PP por Círculo de Feitiço:

|     | PP  |
| --- | --- |
| 1º  | 0   |
| 2º  | 1   |
| 3º  | 3   |
| 4º  | 5   |
| 5º  | 7   |
| 6º  | 9   |
| 7º  | 12  |
| 8º  | 15  |

Matrizes de Feitiço por Habilidade de Conjuração:

| Arcano   | Natureza | Religião   |
| -------- | -------- | ---------- |
| Arcana   | Natural  | Primordial |
| Adiáfana | Élfica   | Luzidia    |
| Gnômica  | Anã      | Infernal   |
| Mundana  | Mundana  | Mundana    |

Classes de Feitiço:

- Abjuração
- Divinação
- Elemental
- Encantamento
- Evocação
- Ilusão
- Invocação
- Manipulação
- Mística
- Natural
- Necromancia
- Profana
- Sagrada
- Translocação
- Transmutação

Componentes de Feitiço:

- Somático
- Verbal
- Material
- Circular

##### Aprendizado de Feitiço

Parâmetros para cálculo de chance de aprendizado de feitiços:

- Valor do atributo Mente multiplicado por 5
- Modificador total da Habilidade de Conjuração do Feitiço
- Modificador do Círculo do Feitiço
  - 1º Círculo: +30 (Esse bônus não se aplica caso o personagem não conheça nenhum feitiço, ou seja, o bônus é +0 se for o primeiro feitiço)
  - 2º Círculo: +10
  - 3º Círculo: +0
  - 4º Círculo: -10
  - 5º Círculo: -20
  - 6º Círculo: -30
  - 7º Círculo: -50
  - 8º Círculo: -70
- Modificador pelo número de feitiços conhecidos
- Outros Modificadores

Há também o modificador por Matriz, que pode ou não existir. Nesse caso, o bônus é inserido e é marcado qual a matriz do feitiço que está sendo aprendido para somar o bônus à chance total. Só é possível marcar uma matriz por vez.

A Chance de Aprendizado final é a soma de todos esses valores. A chance mínima é 1%, e a máxima é 99%.

### Persistência Local

As fichas devem ser persistidas localmente com IndexedDB, de forma que a ficha e as alterações feitas em tempo real sejam salvas ao fechar o navegador, reiniciar o PC ou recarregar a página.

### Cálculos Automáticos

É interessante que alguns cálculos sejam feitos automaticamente, para facilitar a vida do jogador.

#### Errando Ataques

Quando um ataque erra uma criatura em combate, sua Defesa é diminuída em -1 até o início da próxima rodada até o mínimo de 15. A Defesa volta ao normal caso um ataque acerte aquela criatura.

De forma parecida, testes de resistência que mitigam todo o efeito (ou seja, caso passe no teste de resistência, não sofre nenhum efeito) também sofrem uma penalidade de -1d20 naquele teste específico, funcionando da mesma forma que a defesa: até falhar em um teste, ou até a rodada reiniciar.

É interessante que esse cálculo seja feito automaticamente, com um botão de erro para aplicar a penalidade na Defesa e nos testes de resistência na seção de Combate da ficha (um botão para cada um), e um outro botão de reset para reiniciar a penalidade, um botão para cada um (em caso de acerto) e um botão geral para resetar todos (Defesa e resistências em caso de início de um novo turno).

#### Cálculo de Habilidades

- Modificador de dados (adição ou subtração de dados na rolagem. por exemplo, se a rolagem fosse serr 2d20+2, caso tenha +1 no modificador de dados, ela se tornaria 3d20+2)
- Atributo-chave atual (o que de fato vai ser usado na rolagem e no cálculo, podendeo ser alterado pelo jogador)
- Grau de Habilidade (Leigo (x0), Adepto (x1), Versado (x2), Mestre (x3))
- Modificadores Temporários
- Outros Modificadores
- Modificador Total (Atributo-chave atual \* Grau de Habilidade + Modificadores Temporários + Outros Modificadores)
- Rolagem Final (número de d20 igual ao atributo-chave atual + modificador de dados, somando o modificador total, ou seja, xd20 + y (podendo ser negativo, tanto os dados quanto os modificadores))

##### Penalidade de Carga

As habilidades com a propriedade "Carga" sofrem penalidade de -5 se o personagem estiver Sobrecarregado.

### Rolagem de Testes de Habilidade e Dano

É interessante que haja um rolador automático para testes de habilidade, ataques e dano. Também é interessante modularizar esse rolador para que ele possa ser usado em outras partes do sistema futuramente, como em feitiços, testes de resistência, etc.

Em dados como 2d20+5, o sistema deve rolar dois d20, escolher o maior resultado entre os d20 e somar 5 ao resultado final.
Em dados como 0d20 ou -1d20 o sistema deve rolar dois d20 em caso de 0d20 e três d20 em caso de -1d20, e então escolher o menor resultado.

#### Usos de Habilidades

Ao clicar em uma habilidade na ficha, um side bar retrátil deve abrir e listar vários usos de habilidade, que serão registradas pelo próprio jogador no MVP 1, mas no futuro já virão pré-definidas com base no livro do RPG, com opção de personalização e adição.

É interessante que cada uso de habilidade possa ter seu próprio bônus de dados e modificadores específicos, que não são somados a toda a habilidade, sendo apenas para um uso específico (mas ainda somados ao total da habilidade)
Também é interessante que cada uso de habilidade possa ter um atributo-chave diferente do padrão da habilidade, escolhido pelo jogador.
E como acima, possibilitar a rolagem automática para cada uso de habilidade também.

### Edição de Fichas

É importante que o jogador possa editar qualquer campo da ficha, seja texto, números, listas, etc.
A maior parte dos campos devem estar 'bloqueados' para edição direta e imediata, fazendo com que o jogador tenha que ativar a opção de tornar o campo editável.
Porem, campos que são recursos variáveis e que deve haver muita alterações ao longo do jogo, como PV, PP, inventário, riquezas, anotações, etc, devem estar sempre editáveis diretamente.

### Exportação e Importação de Fichas

Como o projeto vai rodar localmente e não haverá um servidor para armazenar as fichas, é de extrema importância que haja a opção de exportar e importar fichas com o máximo de integridade possível, preservando todos os dados, incluindo anotações e PV atuais.
O formato deve usar o melhor formato possível, dependendo da estruturação dos dados, podendo ser JSON, XML, CSV, YAML, ou outro formato estruturado.

### UX/UI

A interface deve ser limpa, organizada e fácil de usar. Deve priorizar a usabilidade, clareza e acessibilidade.
Deve ser responsiva, adaptando-se bem a diferentes tamanhos de tela e dispositivos.
Deve usar cores, tipografia e elementos visuais que remetam ao tema de fantasia medieval do RPG, mas sem comprometer a legibilidade e usabilidade.
Deve ter uma navegação intuitiva, com menus claros e acessíveis.

#### Tema Escuro e Claro

Deve haver a opção de alternar entre tema escuro e claro, para melhor conforto visual do usuário.

### Testes e Validação

O sistema deve ser testado exaustivamente para garantir que todas as funcionalidades estejam funcionando corretamente. Deve haver validação de dados para evitar entradas inválidas ou inconsistentes.
Deve haver testes de usabilidade para garantir que a interface seja intuitiva e fácil de usar.
