export default class AIService {
  private apiKey: string | null;

  constructor(private onUpdate: (text: string) => void) {
    this.apiKey = localStorage.getItem('openai_api_key');
  }

  public async processText(text: string, prompt: string): Promise<void> {
    if (!this.apiKey) {
      return;
    }
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'assistant',
            content: prompt,
          },
          {
            role: 'user',
            content: text,
          },
        ],
      }),
    };

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', requestOptions);
      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`);
      }

      const data = await response.json();
      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        const fullText = data.choices[0].message.content;
        this.typeTextByParts(fullText);
      } else {
        //
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Ошибка при обращении к OpenAI API:', error);
    }
  }

  private typeTextByParts(fullText: string, partSize: number = 5, delay: number = 100) {
    let index = 0;
    const typePart = () => {
      if (index < fullText.length) {
        const nextPart = fullText.substring(index, Math.min(index + partSize, fullText.length));
        this.onUpdate(nextPart);
        index += partSize;
        setTimeout(typePart, delay);
      }
    };
    typePart();
  }
}
