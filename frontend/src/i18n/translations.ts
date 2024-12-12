export const translations = {
  en: {
    translation: {
      test: {
        status: {
          title: 'Test Status',
          pending: 'Pending',
          running: 'Running',
          completed: 'Completed',
          failed: 'Failed',
          error: 'Error',
          tooltip: {
            pending: 'Test is pending execution',
            running: 'Test is currently running',
            completed: 'Test completed successfully',
            failed: 'Test failed to complete'
          }
        },
        personas: {
          title: 'Test Personas'
        },
        form: {
          sections: {
            basic: 'Basic Information',
            settings: 'Settings',
            personas: 'Personas',
            topics: 'Topics',
            targetAudience: 'Target Audience'
          },
          title: {
            label: 'Title',
            description: 'Give your test a clear and descriptive title',
            placeholder: 'E.g. Black Friday Campaign'
          },
          description: {
            label: 'Main Content',
            description: 'Write the main content to be tested',
            placeholder: 'E.g. Discover the best deals of the year! Up to 70% OFF on selected products.\n- Free shipping on orders over $200\n- Exclusive VIP access 24h before'
          },
          objective: {
            label: 'Objective',
            description: 'What is the main goal of this test?',
            placeholder: 'E.g. Test if the Black Friday campaign message is clear and persuasive'
          },
          topics: {
            label: 'Topics',
            description: 'Add relevant topics to help classify your test',
            placeholder: 'E.g. conversion, landing page, marketing'
          },
          personas: {
            label: 'Personas',
            description: 'Select the personas participating in the test',
            title: 'Personas Involved',
            select: 'Select Personas',
            modalTitle: 'Select Test Personas',
            noPersonas: 'No personas found. Create a persona first.',
            selectAll: 'Select All',
            deselectAll: 'Deselect All',
            years: 'years old'
          },
          targetAudience: {
            label: 'Target Audience',
            ageRange: {
              label: 'Age Range',
              description: 'Age of the target audience',
              placeholder: 'Ex: 25-35 years'
            },
            location: {
              label: 'Location',
              description: 'Geographic region of the target audience',
              placeholder: 'Ex: New York, USA'
            },
            income: {
              label: 'Income',
              description: 'Income range of the target audience',
              placeholder: 'Ex: $5,000 - $10,000'
            },
            interests: {
              label: 'Interests',
              description: 'What your target audience likes and values',
              placeholder: 'Add an interest (Ex: technology, innovation)'
            },
            painPoints: {
              label: 'Pain Points',
              description: 'Main problems and challenges',
              placeholder: 'Add a pain point (Ex: lack of time, complexity)'
            },
            needs: {
              label: 'Needs',
              description: 'What your target audience needs to solve',
              placeholder: 'Add a need (Ex: automate tasks, reduce costs)'
            }
          },
          settings: {
            maxIterations: {
              label: 'Maximum Iterations',
              description: 'Maximum number of interaction rounds',
              placeholder: 'E.g. 5'
            },
            responseFormat: {
              label: 'Response Format',
              description: 'How detailed should the responses be',
              placeholder: 'E.g. detailed'
            },
            interactionStyle: {
              label: 'Interaction Style',
              description: 'How the conversation should flow',
              placeholder: 'E.g. natural'
            }
          },
          submit: 'Create Test',
          error: 'Error creating test',
          validation: {
            required: {
              title: 'Title is required',
              description: 'Content is required',
              objective: 'Objective is required',
              ageRange: 'Age Range is required',
              location: 'Location is required',
              income: 'Income is required',
              interests: 'At least one interest is required',
              painPoints: 'At least one pain point is required',
              needs: 'At least one need is required'
            }
          }
        },
        actions: {
          start: 'Start Test',
          stop: 'Stop Test',
          delete: 'Delete'
        },
        messages: {
          startLoading: 'Starting test...',
          startLoadingDesc: 'Please wait while personas analyze the content',
          running: 'Test in progress',
          runningDesc: 'Personas are analyzing the content...',
          stopped: 'Test stopped successfully',
          deleted: 'Message deleted',
          error: 'Error',
          success: 'Test started successfully',
          deleteError: 'Error deleting message'
        },
        thinking: {
          states: {
            analyzing: 'Analyzing content...',
            reflecting: 'Reflecting on context...',
            organizing: 'Organizing thoughts...',
            elaborating: 'Elaborating response...',
            reviewing: 'Reviewing arguments...',
            writing: 'Writing response...',
            finishing: 'Finishing...'
          }
        },
        details: {
          title: 'Test Details',
          objective: 'Objective',
          topics: 'Topics',
          targetAudience: 'Target Audience',
          ageRange: 'Age Range',
          location: 'Location',
          income: 'Income',
          interests: 'Interests',
          painPoints: 'Pain Points',
          needs: 'Needs'
        },
        conversation: {
          title: 'Conversation',
          timeline: 'Timeline',
          grouped: 'Grouped',
          summary: 'Summary'
        },
        analysis: {
          title: 'Simulation Analysis',
          summary: 'Summary',
          insights: 'Key Insights',
          tags: 'Common Tags',
          detailed: 'Detailed Analysis'
        },
        personalContext: {
          title: 'Personal Context',
          digitalComfort: 'Digital Comfort',
          routineAlignment: 'Routine Alignment',
          locationRelevance: 'Location Relevance',
          familyConsideration: 'Family Consideration',
          financialPerspective: 'Financial Perspective'
        },
        create: {
          title: 'Create New Test',
          description: 'Define your test scenario and select personas to run it with',
          messages: {
            success: 'Test created successfully',
            error: 'Error creating test'
          }
        },
        notFound: 'Test not found',
        edit: {
          title: 'Edit Test',
          description: 'Update your test configuration',
          messages: {
            success: 'Test updated successfully',
            error: 'Error updating test'
          }
        },
        message: {
          deleteTooltip: 'Delete message',
          deleteButton: 'Delete message',
          firstImpression: 'First impression',
          benefits: 'Key benefits',
          concerns: 'Concerns and obstacles',
          decisionFactors: 'Decision factors',
          suggestions: 'Suggestions for improvement',
          targetAudience: {
            title: 'Target audience alignment',
            ageMatch: 'Age match',
            locationMatch: 'Location match',
            incomeMatch: 'Income match',
            interestOverlap: 'Interest overlap',
            painPointRelevance: 'Pain point relevance'
          },
          tags: {
            title: 'Tags',
            positive: 'Positive',
            negative: 'Negative',
            opportunity: 'Opportunities'
          },
          metrics: {
            title: 'Metrics',
            sentiment: 'Sentiment',
            confidence: 'Confidence',
            relevance: 'Relevance',
            value: 'Value',
            feasibility: 'Feasibility'
          }
        },
        analytics: {
          overallSentiment: {
            label: 'Overall Sentiment',
            help: 'Average of all interactions'
          },
          totalMessages: {
            label: 'Total Messages',
            help: 'Recorded interactions'
          },
          activePersonas: {
            label: 'Active Personas',
            help: 'Test participants'
          }
        }
      },
      persona: {
        title: 'Personas',
        sections: {
          personal: 'Personal Characteristics',
          daily: 'Daily Life',
          personality: 'Personality and History',
          motivations: 'Motivations and Challenges',
          goals: 'Goals',
          interests: 'Interests',
          location: 'Location and Context'
        },
        actions: {
          create: 'Create Persona',
          edit: 'Edit',
          delete: 'Delete',
          back: 'Back to Personas',
          editTitle: 'Edit Persona',
          confirm: 'Confirm',
          cancel: 'Cancel'
        },
        units: {
          years: 'years'
        },
        messages: {
          deleted: 'Persona deleted',
          deleteError: 'Failed to delete persona',
          loadError: 'Failed to load personas',
          saveError: 'Error saving persona',
          validationError: 'Please correct the form errors'
        },
        empty: {
          title: 'No personas yet',
          description: 'Create your first persona to get started',
          action: 'Create Persona'
        },
        deleteDialog: {
          title: 'Delete Persona',
          message: 'Are you sure? This action cannot be undone.'
        },
        fields: {
          name: {
            label: 'Name',
            placeholder: 'Ex: John Smith, Mary Johnson',
            description: 'Full name of the persona'
          },
          description: {
            label: 'Description',
            placeholder: 'Ex: John is a family man who works as a furniture salesman. He seeks to balance work with family time and is always looking for ways to increase his income.',
            description: 'A brief story about who this person is'
          },
          age: {
            label: 'Age',
            placeholder: 'Ex: 35',
            description: 'Current age'
          },
          occupation: {
            label: 'Occupation',
            placeholder: 'Ex: Salesman, Teacher, App Driver',
            description: 'Current job or occupation'
          },
          education: {
            label: 'Education',
            placeholder: 'Ex: High School Graduate, Sales Technician',
            description: 'Education level'
          },
          income: {
            label: 'Monthly Income',
            placeholder: 'Ex: $3,500, Between $2,000 and $3,000',
            description: 'Average income per month'
          },
          location: {
            label: 'City/State',
            placeholder: 'Ex: San Francisco, CA',
            description: 'Current residence'
          },
          family_status: {
            label: 'Family',
            placeholder: 'Ex: Married, 2 children (8 and 12 years)',
            description: 'Current family situation'
          },
          daily_routine: {
            label: 'Daily Routine',
            placeholder: 'Ex: Wakes up at 7am, takes kids to school, works from 9am to 6pm at the store, helps kids with homework at night',
            description: 'What a typical day looks like'
          },
          digital_skills: {
            label: 'Technology Usage',
            placeholder: 'Ex: Uses WhatsApp and Facebook daily, shops online occasionally, uses banking apps',
            description: 'How they interact with technology and apps'
          },
          spending_habits: {
            label: 'Shopping Habits',
            placeholder: 'Ex: Compares prices before buying, prefers to split large purchases, uses discount coupons',
            description: 'How they spend their money'
          },
          habits: {
            label: 'Habits',
            placeholder: 'Ex: Likes to read news in the morning, exercises 3x a week, watches series at night',
            description: 'Common habits and routines'
          },
          personality_traits: {
            label: 'Personality Traits',
            placeholder: 'Ex: Extroverted, communicative, detail-oriented...',
            description: 'Describe the main personality traits'
          },
          background_story: {
            label: 'Life Story',
            placeholder: 'Ex: Born into a humble family, started working at 16...',
            description: 'Tell a bit about this persona\'s life story'
          },
          traits: {
            label: 'Characteristics',
            placeholder: 'Add characteristic...',
            description: 'Add specific characteristics that define this persona'
          },
          challenges: {
            label: 'Difficulties',
            placeholder: 'Ex: Has little free time, worried about rising expenses, wants better education for children',
            description: 'Main problems and concerns'
          },
          frustrations: {
            label: 'Frustrations',
            placeholder: 'Ex: Tired of wasting time in traffic, unsatisfied with current health plan',
            description: 'What bothers them the most in daily life'
          },
          decision_factors: {
            label: 'How They Decide',
            placeholder: 'Ex: Researches a lot before buying, trusts friends\' recommendations, prioritizes cost-benefit',
            description: 'What they consider when making decisions'
          },
          goals: {
            label: 'Add Goal',
            placeholder: 'Ex: Buy own house, Pay for children\'s college',
            description: 'Main life goals'
          },
          interests: {
            label: 'Add Interest',
            placeholder: 'Ex: Technology, Cooking, Travel',
            description: 'Main interests and hobbies'
          }
        },
        sections: {
          personal: 'Personal Characteristics',
          daily: 'Daily Life',
          personality: 'Personality and History',
          motivations: 'Motivations and Challenges',
          goals: 'Goals',
          interests: 'Interests',
          location: 'Location and Context'
        }
      },
      costs: {
        title: 'Usage and Costs',
        error: 'Error loading usage data',
        loading: 'Loading...',
        dailyUsage: 'Daily Usage',
        modelDistribution: 'Model Distribution',
        testsUsage: {
          title: 'Tests Usage',
          test: 'Test',
          date: 'Date',
          cost: 'Cost',
          actions: 'Actions',
          details: 'Details'
        },
        usageStats: {
          totalCost: 'Total Cost',
          messagesExchanged: 'Messages Exchanged',
          averageCost: 'Average Cost per Message',
          tokensUsed: 'Tokens Used'
        },
        testDetails: {
          title: 'Test Details',
          close: 'Close',
          noData: 'No usage data available for this test'
        }
      },
      dashboard: {
        overview: {
          title: 'Dashboard Overview',
          description: 'Monitor your test progress and persona activity',
        },
        stats: {
          totalTests: 'Total Tests',
          completed: 'completed',
          activePersonas: 'Active Personas',
          runningTests: 'Running Tests',
          successRate: 'Test Success Rate',
        },
        create: {
          test: 'New Test',
          persona: 'New Persona',
          costs: 'Costs'
        },
        recentTests: {
          title: 'Recent Tests',
          empty: 'No tests found',
          createFirst: 'Create your first test to get started',
        },
      },
      auth: {
        login: {
          title: 'Welcome Back',
          subtitle: 'Sign in to continue to Crowdelic',
          email: 'Email',
          password: 'Password',
          submit: 'Sign In',
          registerLink: "Don't have an account?",
          registerAction: 'Sign Up',
          error: 'Failed to login'
        },
        register: {
          title: 'Welcome!',
          subtitle: 'Create your account to start using Crowdelic',
          registerWith: 'Register With',
          form: {
            title: 'Register',
            name: 'Name',
            email: 'Email',
            password: 'Password',
            company: 'Company',
            submit: 'Create Account'
          },
          loginLink: 'Already have an account?',
          loginAction: 'Sign In',
          error: 'Registration failed'
        }
      },
      menu: {
        home: 'Home',
        personas: 'Personas',
        tests: 'Tests',
        costs: 'Costs',
        dashboard: 'Dashboard',
        logout: 'Logout'
      },
      landing: {
        hero: {
          title: 'Transform your ideas into',
          highlight: 'powerful insights',
          description: 'AI-powered user testing platform that helps you better understand your audience and make data-driven decisions.',
          cta: 'Get Started',
          secondary: 'Learn More'
        },
        features: {
          title: 'Why choose Crowdelic?',
          feature1: {
            title: 'Fast and Efficient',
            description: 'Get valuable insights in minutes, not weeks'
          },
          feature2: {
            title: 'Intelligent Personas',
            description: 'Simulate real interactions with AI-based personas'
          },
          feature3: {
            title: 'Detailed Analysis',
            description: 'Visualize data and metrics in real-time'
          },
          feature4: {
            title: 'Total Customization',
            description: 'Tailor tests to your specific needs'
          }
        }
      }
    }
  },
  pt: {
    translation: {
      test: {
        status: {
          title: 'Status do teste',
          pending: 'Pendente',
          running: 'Em execução',
          completed: 'Concluído',
          failed: 'Falhou',
          error: 'Erro',
          tooltip: {
            pending: 'Teste aguardando execução',
            running: 'Teste em execução',
            completed: 'Teste concluído com sucesso',
            failed: 'Teste falhou ao completar'
          }
        },
        personas: {
          title: 'Personas do teste'
        },
        form: {
          sections: {
            basic: 'Informações básicas',
            settings: 'Configurações',
            personas: 'Personas',
            topics: 'Tópicos',
            targetAudience: 'Público-Alvo'
          },
          title: {
            label: 'Título',
            description: 'Dê um título claro e descritivo para seu teste',
            placeholder: 'Ex: Campanha Black Friday'
          },
          description: {
            label: 'Conteúdo principal',
            description: 'Escreva o conteúdo principal a ser testado',
            placeholder: 'Ex: Descubra as melhores ofertas do ano! Até 70% OFF em produtos selecionados.\n- Frete grátis em compras acima de R$ 200\n- Acesso VIP exclusivo 24h antes'
          },
          objective: {
            label: 'Objetivo',
            description: 'Qual é o principal objetivo deste teste?',
            placeholder: 'Ex: Testar se a mensagem da campanha de Black Friday está clara e persuasiva'
          },
          topics: {
            label: 'Tópicos',
            description: 'Adicione tópicos relevantes para ajudar a classificar seu teste',
            placeholder: 'Ex: conversão, landing page, marketing'
          },
          personas: {
            label: 'Personas',
            description: 'Selecione as personas que você deseja usar neste teste',
            title: 'Personas envolvidas',
            select: 'Selecionar personas',
            modalTitle: 'Selecionar personas do teste',
            noPersonas: 'Nenhuma persona encontrada. Crie uma persona primeiro.',
            selectAll: 'Selecionar todas',
            deselectAll: 'Desmarcar todas',
            years: 'anos'
          },
          targetAudience: {
            label: 'Público-alvo',
            ageRange: {
              label: 'Faixa tária',
              description: 'Idade do público-alvo',
              placeholder: 'Ex: 25-35 anos'
            },
            location: {
              label: 'Localização',
              description: 'Região geográfica do público',
              placeholder: 'Ex: São Paulo, Brasil'
            },
            income: {
              label: 'Renda',
              description: 'Faixa de renda do público',
              placeholder: 'Ex: R$ 5.000 - R$ 10.000'
            },
            interests: {
              label: 'Interesses',
              description: 'O que seu público gosta e valoriza',
              placeholder: 'Adicionar interesse (Ex: tecnologia, inovação)'
            },
            painPoints: {
              label: 'Pontos de dor',
              description: 'Principais problemas e desafios',
              placeholder: 'Adicionar ponto de dor (Ex: falta de tempo, complexidade)'
            },
            needs: {
              label: 'Necessidades',
              description: 'O que seu público precisa resolver',
              placeholder: 'Adicionar necessidade (Ex: automatizar tarefas, reduzir custos)'
            }
          },
          settings: {
            maxIterations: {
              label: 'Número máximo de iterações',
              description: 'Número máximo de rodadas de interação',
              placeholder: 'Ex: 5'
            },
            responseFormat: {
              label: 'Formato de resposta',
              description: 'Quão detalhadas devem ser as respostas',
              placeholder: 'Ex: detalhado'
            },
            interactionStyle: {
              label: 'Estilo de interação',
              description: 'Como a conversa deve fluir',
              placeholder: 'Ex: natural'
            }
          },
          submit: 'Criar teste',
          error: 'Erro ao criar teste',
          validation: {
            required: {
              title: 'O título é obrigatório',
              description: 'O conteúdo é obrigatório',
              objective: 'O objetivo é obrigatório',
              ageRange: 'A faixa etária é obrigatória',
              location: 'A localização é obrigatória',
              income: 'A renda é obrigatória',
              interests: 'Pelo menos um interesse é obrigatório',
              painPoints: 'Pelo menos um ponto de dor é obrigatório',
              needs: 'Pelo menos uma necessidade é obrigatória'
            }
          }
        },
        actions: {
          start: 'Iniciar teste',
          stop: 'Parar teste',
          delete: 'Excluir'
        },
        messages: {
          startLoading: 'Iniciando teste...',
          startLoadingDesc: 'Aguarde enquanto as personas analisam o conteúdo',
          running: 'Teste em andamento',
          runningDesc: 'As personas estão analisando o conteúdo...',
          stopped: 'Teste parado com sucesso',
          deleted: 'Mensagem excluída',
          error: 'Erro',
          success: 'Teste iniciado com sucesso',
          deleteError: 'Erro ao excluir mensagem'
        },
        thinking: {
          states: {
            analyzing: 'Analisando o conteúdo...',
            reflecting: 'Refletindo sobre o contexto...',
            organizing: 'Organizando minhas ideias...',
            elaborating: 'Elaborando minha resposta...',
            reviewing: 'Revisando meus argumentos...',
            writing: 'Escrevendo minha resposta...',
            finishing: 'Finalizando...'
          }
        },
        details: {
          title: 'Detalhes do teste',
          objective: 'Objetivo',
          topics: 'Tópicos',
          targetAudience: 'Público-alvo',
          ageRange: 'Faixa etária',
          location: 'Localização',
          income: 'Renda',
          interests: 'Interesses',
          painPoints: 'Pontos de dor',
          needs: 'Necessidades'
        },
        conversation: {
          title: 'Conversa',
          timeline: 'Linha do tempo',
          grouped: 'Agrupado',
          summary: 'Resumo'
        },
        analysis: {
          title: 'Análise da simulação',
          summary: 'Resumo',
          insights: 'Principais insights',
          tags: 'Tags comuns',
          detailed: 'Análise detalhada'
        },
        personalContext: {
          title: 'Contexto pessoal',
          digitalComfort: 'Conforto digital',
          routineAlignment: 'Alinhamento com a rotina',
          locationRelevance: 'Relevância da localização',
          familyConsideration: 'Consideração familiar',
          financialPerspective: 'Perspectiva financeira'
        },
        create: {
          title: 'Criar novo teste',
          description: 'Defina seu cenário de teste e selecione personas para executá-lo',
          messages: {
            success: 'Teste criado com sucesso',
            error: 'Erro ao criar teste'
          }
        },
        notFound: 'Teste não encontrado',
        edit: {
          title: 'Editar teste',
          description: 'Atualize a configuração do seu teste',
          messages: {
            success: 'Teste atualizado com sucesso',
            error: 'Erro ao atualizar teste'
          }
        },
        message: {
          deleteTooltip: 'Excluir mensagem',
          deleteButton: 'Excluir mensagem',
          firstImpression: 'Primeira impressão',
          benefits: 'Benefícios principais',
          concerns: 'Preocupações e obstáculos',
          decisionFactors: 'Fatores de decisão',
          suggestions: 'Sugestões de melhoria',
          targetAudience: {
            title: 'Alinhamento com público-alvo',
            ageMatch: 'Compatibilidade de idade',
            locationMatch: 'Compatibilidade de localização',
            incomeMatch: 'Compatibilidade de renda',
            interestOverlap: 'Sobreposição de interesses',
            painPointRelevance: 'Relevância dos pontos de dor'
          },
          tags: {
            title: 'Tags',
            positive: 'Positivos',
            negative: 'Negativos',
            opportunity: 'Oportunidades'
          },
          metrics: {
            title: 'Métricas',
            sentiment: 'Sentimento',
            confidence: 'Confiança',
            relevance: 'Relevância',
            value: 'Valor',
            feasibility: 'Viabilidade'
          }
        },
        analytics: {
          overallSentiment: {
            label: 'Sentimento geral',
            help: 'Média de todas as interações'
          },
          totalMessages: {
            label: 'Total de mensagens',
            help: 'Interações registradas'
          },
          activePersonas: {
            label: 'Personas ativas',
            help: 'Participantes no teste'
          }
        }
      },
      persona: {
        title: 'Personas',
        sections: {
          personal: 'Informações pessoais',
          daily: 'Rotina diária',
          personality: 'Personalidade',
          motivations: 'Motivações',
          goals: 'Objetivos',
          interests: 'Interesses',
          location: 'Localização e contexto'
        },
        actions: {
          create: 'Criar persona',
          edit: 'Editar',
          delete: 'Excluir',
          back: 'Voltar para personas',
          editTitle: 'Editar persona',
          confirm: 'Confirmar',
          update: 'Atualizar Persona',
          cancel: 'Cancelar'
        },
        units: {
          years: 'anos'
        },
        messages: {
          deleted: 'Persona excluída',
          deleteError: 'Falha ao excluir persona',
          loadError: 'Falha ao carregar personas',
          saveError: 'Erro ao salvar persona',
          validationError: 'Por favor, corrija os erros do formulário'
        },
        empty: {
          title: 'Nenhuma persona ainda',
          description: 'Crie sua primeira persona para começar',
          action: 'Criar persona'
        },
        deleteDialog: {
          title: 'Excluir persona',
          message: 'Tem certeza? Essa ação não pode ser desfeita.'
        },
        fields: {
          name: {
            label: 'Nome',
            placeholder: 'Ex: João Silva, Maria Santos',
            description: 'Nome completo da persona'
          },
          description: {
            label: 'Descrição',
            placeholder: 'Ex: João é um pai de família que trabalha como vendedor de móveis. Ele busca equilibrar o trabalho com o tempo em família e está sempre procurando maneiras de aumentar sua renda.',
            description: 'Uma breve história sobre quem é esta pessoa'
          },
          age: {
            label: 'Idade',
            placeholder: 'Ex: 35',
            description: 'Idade atual'
          },
          occupation: {
            label: 'Ocupação',
            placeholder: 'Ex: Vendedor, Professor, Motorista de aplicativo',
            description: 'Trabalho ou ocupação atual'
          },
          education: {
            label: 'Educação',
            placeholder: 'Ex: Ensino médio completo, Técnico em vendas',
            description: 'Nível de educação'
          },
          income: {
            label: 'Renda mensal',
            placeholder: 'Ex: R$ 3.500, Entre R$ 2.000 e R$ 3.000',
            description: 'Renda média por mês'
          },
          location: {
            label: 'Cidade/Estado',
            placeholder: 'Ex: Campinas, SP',
            description: 'Onde mora atualmente'
          },
          family_status: {
            label: 'Família',
            placeholder: 'Ex: Casado, 2 filhos (8 e 12 anos)',
            description: 'Situação familiar atual'
          },
          daily_routine: {
            label: 'Rotina diária',
            placeholder: 'Ex: Acorda às 7h, leva as crianças na escola, trabalha das 9h às 18h na loja, à noite ajuda os filhos com a lição de casa',
            description: 'Como é um dia típico na vida desta pessoa'
          },
          digital_skills: {
            label: 'Uso de tecnologia',
            placeholder: 'Ex: Usa WhatsApp e Facebook diariamente, faz compras online às vezes, usa aplicativos de banco',
            description: 'Como se relaciona com tecnologia e apps'
          },
          spending_habits: {
            label: 'Hábitos de compra',
            placeholder: 'Ex: Compara preços antes de comprar, prefere parcelar compras grandes, usa cupons de desconto',
            description: 'Como gasta seu dinheiro'
          },
          habits: {
            label: 'Hábitos',
            placeholder: 'Ex: Gosta de ler notícias pela manhã, faz exercícios 3x por semana, assiste séries à noite',
            description: 'Hábitos e rotinas comuns'
          },
          personality_traits: {
            label: 'Traços de personalidade',
            placeholder: 'Ex: Extrovertido, comunicativo, detalhista...',
            description: 'Descreva os principais traços de personalidade'
          },
          background_story: {
            label: 'História de vida',
            placeholder: 'Ex: Nasceu em uma família humilde, começou a trabalhar aos 16 anos...',
            description: 'Conte um pouco da história de vida desta persona'
          },
          traits: {
            label: 'Características',
            placeholder: 'Adicionar característica...',
            description: 'Adicione características específicas que definem esta persona'
          },
          challenges: {
            label: 'Dificuldades',
            placeholder: 'Ex: Tem pouco tempo livre, preocupado com as despesas crescentes, quer dar melhor educação para os filhos',
            description: 'Principais problemas e preocupações'
          },
          frustrations: {
            label: 'Frustrações',
            placeholder: 'Ex: Cansado de perder tempo no trânsito, insatisfeito com o plano de saúde atual',
            description: 'O que mais incomoda no dia a dia'
          },
          decision_factors: {
            label: 'Como decide',
            placeholder: 'Ex: Pesquisa muito antes de comprar, confia em recomendações de amigos, prioriza custo-benefício',
            description: 'O que considera ao tomar decisões'
          },
          goals: {
            label: 'Adicionar objetivo',
            placeholder: 'Ex: Comprar casa própria, pagar faculdade dos filhos',
            description: 'Principais objetivos de vida'
          },
          interests: {
            label: 'Adicionar interesse',
            placeholder: 'Ex: Tecnologia, culinária, viagens',
            description: 'Principais interesses e hobbies'
          }
        },
        sections: {
          personal: 'Informações pessoais',
          daily: 'Rotina diária',
          personality: 'Personalidade',
          motivations: 'Motivações',
          goals: 'Objetivos',
          interests: 'Interesses',
          location: 'Localização e contexto'
        }
      },
      costs: {
        title: 'Uso e custos',
        error: 'Erro ao carregar dados de uso',
        loading: 'Carregando...',
        dailyUsage: 'Uso diário',
        modelDistribution: 'Distribuição por modelo',
        testsUsage: {
          title: 'Uso por teste',
          test: 'Teste',
          date: 'Data',
          cost: 'Custo',
          actions: 'Ações',
          details: 'Detalhes'
        },
        usageStats: {
          totalCost: 'Custo total',
          messagesExchanged: 'Mensagens trocadas',
          averageCost: 'Custo médio por mensagem',
          tokensUsed: 'Tokens utilizados'
        },
        testDetails: {
          title: 'Detalhes do teste',
          close: 'Fechar',
          noData: 'Nenhum dado de uso disponível para este teste'
        }
      },
      dashboard: {
        overview: {
          title: 'Visão geral',
          description: 'Monitore o progresso dos seus testes e atividade das personas',
        },
        stats: {
          totalTests: 'Total de testes',
          completed: 'concluídos',
          activePersonas: 'Personas ativas',
          runningTests: 'Testes em execução',
          successRate: 'Taxa de sucesso',
        },
        create: {
          test: 'Novo teste',
          persona: 'Nova persona',
          costs: 'Custos'
        },
        recentTests: {
          title: 'Testes recentes',
          empty: 'Nenhum teste encontrado',
          createFirst: 'Crie seu primeiro teste para começar',
        },
      },
      auth: {
        login: {
          title: 'Bem-vindo de volta',
          subtitle: 'Entre para continuar no Crowdelic',
          email: 'Email',
          password: 'Senha',
          submit: 'Entrar',
          registerLink: 'Não tem uma conta?',
          registerAction: 'Cadastre-se',
          error: 'Falha ao fazer login'
        },
        register: {
          title: 'Bem-vindo!',
          subtitle: 'Crie sua conta para começar a usar o Crowdelic',
          registerWith: 'Registrar com',
          form: {
            title: 'Cadastro',
            name: 'Nome',
            email: 'Email',
            password: 'Senha',
            company: 'Empresa',
            submit: 'Criar conta'
          },
          loginLink: 'Já tem uma conta?',
          loginAction: 'Entrar',
          error: 'Falha no cadastro'
        }
      },
      menu: {
        home: 'Início',
        personas: 'Personas',
        tests: 'Testes',
        costs: 'Custos',
        dashboard: 'Dashboard',
        logout: 'Sair'
      },
      landing: {
        hero: {
          title: 'Transforme suas ideias em',
          highlight: 'insights poderosos',
          description: 'Plataforma de testes de usuário alimentada por IA que ajuda você a entender melhor seu público e tomar decisões baseadas em dados.',
          cta: 'Comece Agora',
          secondary: 'Saiba Mais'
        },
        features: {
          title: 'Por que escolher o Crowdelic?',
          feature1: {
            title: 'Rápido e Eficiente',
            description: 'Obtenha insights valiosos em minutos, não em semanas'
          },
          feature2: {
            title: 'Personas Inteligentes',
            description: 'Simule interações reais com personas baseadas em IA'
          },
          feature3: {
            title: 'Análise Detalhada',
            description: 'Visualize dados e métricas em tempo real'
          },
          feature4: {
            title: 'Personalização Total',
            description: 'Adapte os testes às suas necessidades específicas'
          }
        }
      }
    }
  }
};
