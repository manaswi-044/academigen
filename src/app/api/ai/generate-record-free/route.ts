/**
 * Free AI Alternative: Using Groq API (completely free tier available)
 * No payment required - Groq offers free inference on open-source models
 */

export const runtime = 'nodejs';

import { createClient } from '@/lib/supabase/server';

interface GenerateRequest {
  programTitle: string;
  language: string;
  subject: string;
  additionalContext?: string;
}

interface GenerateResponse {
  aim: string;
  algorithm: string;
  code: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json() as GenerateRequest;
    const { programTitle, language, subject, additionalContext } = body;

    if (!programTitle || !language || !subject) {
      return Response.json(
        { error: 'Missing required fields: programTitle, language, subject' },
        { status: 400 }
      );
    }

    // Try Groq API (free)
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      return await generateWithGroq(programTitle, language, subject, additionalContext);
    }

    // Fallback: Use offline template (no API required)
    return generateOfflineTemplate(programTitle, language, subject);
  } catch (err: any) {
    console.error('[Generate Error]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

/**
 * Generate using Groq (completely free)
 * Sign up at https://console.groq.com (no credit card needed)
 */
async function generateWithGroq(
  programTitle: string,
  language: string,
  subject: string,
  additionalContext?: string
): Promise<Response> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return generateOfflineTemplate(programTitle, language, subject);
  }

  const prompt = `You are an expert academic record generator. Generate a complete lab record based on the following requirements:

Program: ${programTitle}
Language: ${language}
Subject: ${subject}
${additionalContext ? `Additional Context: ${additionalContext}` : ''}

Generate the following sections in JSON format:
{
  "aim": "[1-2 sentence aim of the program]",
  "algorithm": "[Step-by-step algorithm or pseudocode, numbered]",
  "code": "[Complete, working, well-commented code in ${language}]"
}

Return ONLY valid JSON, no markdown or extra text.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768', // Free model
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.warn('Groq API failed, using offline template');
      return generateOfflineTemplate(programTitle, language, subject);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return Response.json(parsed);
      }
    } catch {}

    return generateOfflineTemplate(programTitle, language, subject);
  } catch (err) {
    console.warn('Groq request failed, using offline template', err);
    return generateOfflineTemplate(programTitle, language, subject);
  }
}

/**
 * Offline template generator (completely free, no API)
 * Uses intelligent patterns to generate reasonable code
 */
function generateOfflineTemplate(
  programTitle: string,
  language: string,
  subject: string
): Response {
  const templates: Record<string, Record<string, { aim: string; algorithm: string; code: string }>> = {
    Python: {
      'bubble_sort': {
        aim: `To implement Bubble Sort algorithm in Python and understand the sorting mechanism`,
        algorithm: `1. Start with the first element
2. Compare adjacent elements
3. If first element > second element, swap them
4. Move to the next pair
5. Repeat until the list is sorted
6. Repeat for all passes until no swaps occur`,
        code: `def bubble_sort(arr):
    """Sort array using bubble sort algorithm"""
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr

# Driver code
arr = [64, 34, 25, 12, 22, 11, 90]
print("Original array:", arr)
print("Sorted array:", bubble_sort(arr))`,
      },
      'linear_search': {
        aim: `To implement Linear Search algorithm and find an element in an unsorted array`,
        algorithm: `1. Start from the first element
2. Compare with the target element
3. If match found, return the index
4. If not, move to the next element
5. Repeat until end of array
6. Return -1 if element not found`,
        code: `def linear_search(arr, target):
    """Search for target in array using linear search"""
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1

# Driver code
arr = [4, 2, 7, 1, 9, 3]
target = 7
result = linear_search(arr, target)
if result != -1:
    print(f"Element found at index: {result}")
else:
    print("Element not found")`,
      },
      'factorial': {
        aim: `To calculate factorial of a number using recursion`,
        algorithm: `1. Base case: if n = 0 or 1, return 1
2. Recursive case: return n * factorial(n-1)
3. Call factorial function with input number`,
        code: `def factorial(n):
    """Calculate factorial of n"""
    if n < 0:
        return "Factorial not defined for negative numbers"
    elif n == 0 or n == 1:
        return 1
    else:
        return n * factorial(n - 1)

# Driver code
num = 5
print(f"Factorial of {num} is: {factorial(num)}")`,
      },
      'fibonacci': {
        aim: `To generate Fibonacci sequence up to n terms`,
        algorithm: `1. Initialize first two terms as 0 and 1
2. For each subsequent term, add previous two terms
3. Print the sequence`,
        code: `def fibonacci(n):
    """Generate fibonacci sequence up to n terms"""
    fib_sequence = []
    a, b = 0, 1
    for _ in range(n):
        fib_sequence.append(a)
        a, b = b, a + b
    return fib_sequence

# Driver code
terms = 10
print(f"Fibonacci sequence ({terms} terms): {fibonacci(terms)}")`,
      },
    },
    C: {
      'bubble_sort': {
        aim: `To implement Bubble Sort algorithm in C`,
        algorithm: `1. Read the array
2. For each pass, compare adjacent elements
3. Swap if first > second
4. Continue until array is sorted`,
        code: `#include <stdio.h>

void bubble_sort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(arr) / sizeof(arr[0]);
    
    bubble_sort(arr, n);
    
    printf("Sorted array: ");
    for (int i = 0; i < n; i++)
        printf("%d ", arr[i]);
    
    return 0;
}`,
      },
    },
    Java: {
      'bubble_sort': {
        aim: `To implement Bubble Sort algorithm in Java`,
        algorithm: `1. Initialize array
2. For each pass, compare adjacent elements
3. Swap if needed
4. Repeat until sorted`,
        code: `public class BubbleSort {
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }
    
    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        bubbleSort(arr);
        System.out.print("Sorted array: ");
        for (int num : arr)
            System.out.print(num + " ");
    }
}`,
      },
    },
  };

  // Find matching template or use generic
  const langTemplates = templates[language] || templates['Python'] || {};

  // Try to match program title
  const titleLower = programTitle.toLowerCase();
  let template = null;

  for (const [key, value] of Object.entries(langTemplates)) {
    if (titleLower.includes(key.replace('_', ' '))) {
      template = value;
      break;
    }
  }

  // Fallback to first available template
  if (!template) {
    template = Object.values(langTemplates)[0] || {
      aim: `To implement and understand ${programTitle}`,
      algorithm: `Step 1: Plan the approach\nStep 2: Write the code\nStep 3: Test with examples`,
      code: `# Code for ${programTitle}\n# Implementation goes here`,
    };
  }

  return Response.json({
    aim: template.aim,
    algorithm: template.algorithm,
    code: template.code,
    source: 'offline_template', // Indicate it's from offline template
  });
}
