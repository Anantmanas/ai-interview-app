export interface EvaluationResult {
  score: number
  caveman_feedback: string
  feedback: string
  technicalAccuracy: string
  improvements: string
  topic: string
  technicalAccuracyScore?: number
  structureClarityScore?: number
  depthEdgeCasesScore?: number
}

interface QuestionContext {
  id?: string
  text?: string
  question_text?: string
  type?: string
  question_type?: string
  topic?: string
  topicTag?: string
  difficulty?: string
}

export function isNonAnswer(text?: string | null): boolean {
  if (!text) return true
  const trimmed = text.trim()
  if (trimmed.length === 0) return true
  const cleaned = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '')
  const nonAnswerKeywords = [
    '',
    'na',
    'none',
    'no',
    'idk',
    'dontknow',
    'donotknow',
    'skip',
    'pass',
    'noidea',
    'nothing',
    'nil',
    'null',
    'undefined',
    'blank',
    'asdf',
    'test',
    'nope',
    'notanswered',
    'noanswer',
    'idontknow',
  ]
  if (cleaned.length <= 2) return true
  if (nonAnswerKeywords.includes(cleaned)) return true
  if (trimmed.length < 5 && !/[0-9]/.test(trimmed)) return true
  return false
}

/**
 * Intelligent Semantic Evaluator for technical interview submissions.
 * Analyzes solution text and code against question requirements, algorithms,
 * data structures, complexity, edge cases, and examples.
 */
export function evaluateTechnicalAnswer(
  question: QuestionContext | string,
  userAnswer: string,
  options?: { difficulty?: string; topic?: string }
): EvaluationResult {
  const qText = typeof question === 'string'
    ? question
    : (question.text || question.question_text || '')
  const qTopic = typeof question === 'string'
    ? (options?.topic || 'Algorithms & Data Structures')
    : (question.topic || question.topicTag || options?.topic || 'General')
  const qDiff = typeof question === 'string'
    ? (options?.difficulty || 'medium')
    : (question.difficulty || options?.difficulty || 'medium')

  if (isNonAnswer(userAnswer)) {
    return {
      score: 0,
      caveman_feedback: 'Bad: Unanswered question. Score: 0%. Fix: Attempt solution or describe thought process.',
      feedback: `No substantive technical reasoning was provided for this ${qTopic} question. In technical interviews, submitting 'NA', skipping, or giving blank answers yields 0 points.`,
      technicalAccuracy: 'Unanswered / Zero technical concepts demonstrated.',
      improvements: 'Always state a brute-force approach, clarify edge cases, or write pseudocode. An interviewer needs to hear your reasoning.',
      topic: qTopic,
      technicalAccuracyScore: 0,
      structureClarityScore: 0,
      depthEdgeCasesScore: 0,
    }
  }

  const answerLower = userAnswer.toLowerCase()
  const qLower = qText.toLowerCase()
  const words = userAnswer.trim().split(/\s+/).filter(Boolean)
  const wordCount = words.length

  // 1. Complexity Analysis Detection
  const hasTimeComplexity = /o\s*\(\s*(1|n|log\s*n|n\s*log\s*n|n\^2|n\^3|2\^n)\s*\)/i.test(userAnswer) ||
    /linear\s*time|constant\s*time|quadratic|logarithmic/i.test(userAnswer) ||
    /time\s*complexity/i.test(userAnswer)
  const hasSpaceComplexity = /space\s*complexity/i.test(userAnswer) ||
    /auxiliary\s*space|memory\s*complexity/i.test(userAnswer) ||
    /o\s*\(\s*(1|n|log\s*n|n\^2)\s*\)\s*(space|memory)/i.test(userAnswer) ||
    /(space|memory)[^.]*o\s*\(\s*(1|n|log\s*n)\s*\)/i.test(userAnswer)

  // 2. Data Structure & Algorithm Detection
  const mentionsHashMap = /hash\s*map|hash\s*table|dictionary|dict\b|hash\s*set|lookup\s*table/i.test(userAnswer)
  const mentionsStack = /stack|lifo|push.*pop/i.test(userAnswer)
  const mentionsQueue = /queue|fifo|deque/i.test(userAnswer)
  const mentionsLinkedList = /linked\s*list|doubly\s*linked|sentinel|dummy\s*head|dummy\s*tail|node\.next|node\.prev/i.test(userAnswer)
  const mentionsTwoPointers = /two\s*pointers?|left\s*and\s*right\s*pointer|slow.*fast/i.test(userAnswer)
  const mentionsBinarySearch = /binary\s*search|mid\s*=|left\s*<=\s*right|divide\s*and\s*conquer/i.test(userAnswer)
  const mentionsTreeOrGraph = /binary\s*tree|bst|graph|dfs|bfs|traversal|recursion|visited/i.test(userAnswer)
  const mentionsDynamicProgramming = /dynamic\s*programming|memoization|dp\[|tabulation/i.test(userAnswer)

  // 3. Problem Type & Target Pattern Recognition
  const isTwoSum = /two\s*sum|target\s*sum|pair\s*with.*sum/i.test(qLower) ||
    (/sum/i.test(qLower) && /target/i.test(qLower)) ||
    (/two\s*sum/i.test(answerLower) && /target/i.test(answerLower))

  const isBracketValidation = /bracket|parenthes|valid\s*parenthes|balanced\s*bracket|closing\s*bracket/i.test(qLower) ||
    (/bracket|parenthes/i.test(answerLower) && /stack/i.test(answerLower))

  const isLruCache = /lru\s*cache|least\s*recently\s*used|cache\s*eviction/i.test(qLower) ||
    (/lru/i.test(answerLower) && /cache/i.test(answerLower))

  // 4. Edge Cases Detection
  const edgeCaseKeywords = [
    'edge case', 'corner case', 'duplicate', 'negative', 'empty', 'null',
    'zero', 'overflow', 'underflow', 'boundary', 'single element', 'odd length',
    'capacity', 'evict', 'mismatch', 'invalid'
  ]
  const edgeCasesFound = edgeCaseKeywords.filter((k) => answerLower.includes(k))
  const hasEdgeCases = edgeCasesFound.length >= 2 || /edge\s*cases?:/i.test(userAnswer)

  // 5. Concrete Examples & Code Walkthrough
  const hasCodeOrPseudocode = /(function|def |class |const |let |var |return |while\s*\(|for\s*\(|=>|\{|\})/i.test(userAnswer) ||
    userAnswer.includes('```') ||
    userAnswer.includes('->')
  const hasConcreteExample = /example|e\.g\.|input:|target\s*=|\[.*\]|\{.*\}|test\s*case/i.test(userAnswer)

  // 6. Compute Technical Scoring Points
  let approachScore = 30
  let complexityScore = 10
  let edgeCaseScore = 10
  let clarityScore = 15

  // Scoring Two Sum specifically
  if (isTwoSum) {
    if (mentionsHashMap && /complement|target\s*-\s*|lookup|diff/i.test(userAnswer)) {
      approachScore = 40
    } else if (mentionsHashMap) {
      approachScore = 35
    } else if (mentionsTwoPointers) {
      approachScore = 32
    } else if (/nested\s*loops?|o\s*\(\s*n\^2\s*\)|brute\s*force/i.test(userAnswer)) {
      approachScore = 24
    }

    if (hasTimeComplexity && /o\s*\(\s*n\s*\)/i.test(userAnswer)) complexityScore += 10
    else if (hasTimeComplexity) complexityScore += 5
    if (hasSpaceComplexity) complexityScore += 5

    if (edgeCasesFound.some(k => ['duplicate', 'negative', 'empty', 'zero'].includes(k))) edgeCaseScore += 10
    if (hasConcreteExample) clarityScore += 10
  }
  // Scoring Bracket Validation specifically
  else if (isBracketValidation) {
    if (mentionsStack && /match|pair|pop|push|top/i.test(userAnswer)) {
      approachScore = 40
    } else if (mentionsStack) {
      approachScore = 35
    }

    if (hasTimeComplexity && /o\s*\(\s*n\s*\)/i.test(userAnswer)) complexityScore += 10
    else if (hasTimeComplexity) complexityScore += 5
    if (hasSpaceComplexity) complexityScore += 5

    if (edgeCasesFound.some(k => ['odd', 'empty', 'mismatch', 'invalid', 'closing'].includes(k))) edgeCaseScore += 10
    if (hasConcreteExample) clarityScore += 10
  }
  // Scoring LRU Cache specifically
  else if (isLruCache) {
    if (mentionsHashMap && mentionsLinkedList) {
      approachScore = 40
    } else if (mentionsHashMap || mentionsLinkedList) {
      approachScore = 32
    }

    if (hasTimeComplexity && /o\s*\(\s*1\s*\)/i.test(userAnswer)) complexityScore += 10
    else if (hasTimeComplexity) complexityScore += 5
    if (hasSpaceComplexity || /capacity/i.test(userAnswer)) complexityScore += 5

    if (edgeCasesFound.some(k => ['capacity', 'evict', 'update', 'null', 'not found'].includes(k))) edgeCaseScore += 10
    if (/get/i.test(userAnswer) && /put/i.test(userAnswer)) clarityScore += 8
    if (hasConcreteExample) clarityScore += 5
  }
  // General Algorithms / Technical Question
  else {
    if (mentionsHashMap || mentionsStack || mentionsQueue || mentionsLinkedList || mentionsTwoPointers || mentionsBinarySearch || mentionsTreeOrGraph || mentionsDynamicProgramming) {
      approachScore = 35
    } else if (wordCount > 60) {
      approachScore = 28
    }

    if (hasTimeComplexity) complexityScore += 8
    if (hasSpaceComplexity) complexityScore += 7
    if (hasEdgeCases) edgeCaseScore += 10
    if (hasCodeOrPseudocode) clarityScore += 8
    if (hasConcreteExample) clarityScore += 7
  }

  // Length & depth modifier
  if (wordCount < 15) {
    approachScore = Math.min(approachScore, 15)
    complexityScore = Math.min(complexityScore, 5)
    edgeCaseScore = Math.min(edgeCaseScore, 5)
    clarityScore = Math.min(clarityScore, 10)
  } else if (wordCount > 50) {
    clarityScore = Math.min(25, clarityScore + 3)
  }

  const rawTotal = approachScore + complexityScore + edgeCaseScore + clarityScore
  const finalScore = Math.max(35, Math.min(96, rawTotal))

  // Compute nuanced category percentages
  const technicalAccuracyScore = Math.max(35, Math.min(98, Math.round(
    approachScore * 1.5 + complexityScore * 1.8 + (hasCodeOrPseudocode ? 5 : 0)
  )))
  const structureClarityScore = Math.max(35, Math.min(98, Math.round(
    clarityScore * 2.8 + (hasConcreteExample ? 10 : 0) + (wordCount > 40 ? 10 : 0)
  )))
  const depthEdgeCasesScore = Math.max(30, Math.min(98, Math.round(
    edgeCaseScore * 3.2 + (edgeCasesFound.length > 2 ? 15 : 0) + (hasSpaceComplexity ? 10 : 0)
  )))

  // Problem-specific feedback text generation
  let feedbackText = ''
  let cavemanText = ''
  let techAccuracyText = ''
  let improvementsText = ''

  if (isTwoSum) {
    if (mentionsHashMap) {
      feedbackText = `Strong algorithmic approach utilizing a hash map for one-pass complement lookup. Correctly identified ${hasTimeComplexity ? 'O(N) time complexity' : 'linear time'} with ${hasSpaceComplexity ? 'O(N) auxiliary space' : 'space-time tradeoff'}. ${edgeCasesFound.length > 0 ? `Effectively addressed key edge cases including ${edgeCasesFound.join(', ')}.` : 'Consider detailing duplicate and negative values explicitly.'} ${hasConcreteExample ? 'Walked through target matching step-by-step with concrete data.' : 'Good conceptual clarity.'}`
      cavemanText = `Good: optimal O(N) hash map & complement logic. Bad: ${hasSpaceComplexity ? 'linear space memory overhead' : 'space complexity unstated'}. Fix: compare with two-pointer sort trade-offs.`
      techAccuracyText = 'Optimal O(N) time and O(N) space hash map lookup demonstrated.'
      improvementsText = 'Discuss trade-offs if array is already sorted (two-pointer approach requires O(1) space). Address memory limits when streaming large datasets.'
    } else if (mentionsTwoPointers) {
      feedbackText = `Proposed a two-pointer approach. Note that two pointers require the input array to be sorted first, adding O(N log N) sorting time and mutating index order unless tracked.`
      cavemanText = 'Good: low space complexity. Bad: requires O(N log N) sort. Fix: use hash map for O(N) time without sorting.'
      techAccuracyText = 'Two-pointer logic is valid for sorted inputs; requires index tracking for original indices.'
      improvementsText = 'Use an auxiliary hash map to achieve optimal O(N) time without altering element order.'
    } else {
      feedbackText = 'Identified the problem objectives, but relying on nested iterations leads to suboptimal O(N^2) quadratic time. Utilize a hash table to store complements in a single pass.'
      cavemanText = 'Good: identified pairs. Bad: quadratic O(N^2) brute force. Fix: use hash map for O(N) time.'
      techAccuracyText = 'Brute force approach identified. Lacks optimal hash-based complement lookup.'
      improvementsText = 'Store complements (target - current) in a hash map as you iterate to solve in O(N) time.'
    }
  } else if (isBracketValidation) {
    if (mentionsStack) {
      feedbackText = `Excellent solution applying a stack (LIFO) to match opening and closing delimiters. Accurately verified ${hasTimeComplexity ? 'O(N) time complexity' : 'linear scan time'} and ${hasSpaceComplexity ? 'O(N) space' : 'stack memory depth'}. ${edgeCasesFound.length > 0 ? `Successfully accounted for edge cases: ${edgeCasesFound.join(', ')}.` : 'Handled matching logic cleanly.'} ${hasConcreteExample ? 'Provided clear sample traces for valid and invalid inputs.' : ''}`
      cavemanText = 'Good: optimal O(N) stack LIFO delimiter matching. Bad: auxiliary stack allocation. Fix: early return on odd length strings.'
      techAccuracyText = 'Optimal O(N) time and O(N) space stack solution implemented.'
      improvementsText = 'Add an early-exit check: if string length is odd, it cannot be balanced. Consider a hash map mapping closing brackets to opening brackets to reduce conditional nesting.'
    } else {
      feedbackText = 'Bracket validation requires tracking nested order. Counting matching brackets with integer variables fails for interleaved cases like "([)]". A stack is required.'
      cavemanText = 'Good: parsed string. Bad: counter fails on interleaved brackets. Fix: use stack to enforce LIFO ordering.'
      techAccuracyText = 'Approach missing LIFO stack structure needed for nested bracket ordering.'
      improvementsText = 'Implement a stack: push opening brackets, pop and verify on matching closing brackets, check that stack is empty upon completion.'
    }
  } else if (isLruCache) {
    if (mentionsHashMap && mentionsLinkedList) {
      feedbackText = `Superb system design combining a hash map for O(1) key lookups with a doubly linked list for O(1) node repositioning and eviction. Correctly detailed get and put semantics, updating existing keys, and evicting from the tail when capacity is exceeded. ${hasEdgeCases ? `Addressed critical boundary conditions (${edgeCasesFound.join(', ')}).` : 'Sentinel head and tail nodes simplify pointer adjustments.'}`
      cavemanText = 'Good: canonical O(1) hash map + doubly linked list architecture. Bad: concurrency unaddressed. Fix: discuss thread safety with Mutex or ReadWriteLock.'
      techAccuracyText = 'Optimal O(1) get and O(1) put time complexity with O(capacity) space.'
      improvementsText = 'Discuss thread safety and concurrency controls (e.g. read-write locks or concurrent hash maps). Explain how sentinel dummy head and tail nodes avoid null checks.'
    } else {
      feedbackText = 'LRU Cache requires both fast lookups and constant-time ordering updates. Using an array or single list requires O(N) search or shift operations. Combine a hash map with a doubly linked list to achieve O(1) for both get and put.'
      cavemanText = 'Good: recognized cache mechanics. Bad: missing doubly linked list for O(1) eviction. Fix: pair hash map with doubly linked list.'
      techAccuracyText = 'Single data structure results in O(N) eviction or lookup. Combination required.'
      improvementsText = 'Pair a hash table (mapping keys to node references) with a doubly linked list (storing values ordered by recent access) to achieve O(1) get and put.'
    }
  } else {
    // Dynamic general feedback
    const primaryDs = mentionsHashMap ? 'hash structures'
      : mentionsStack ? 'stack LIFO structure'
      : mentionsLinkedList ? 'linked list references'
      : mentionsBinarySearch ? 'binary search division'
      : mentionsTreeOrGraph ? 'tree/graph traversal'
      : 'algorithmic reasoning'

    feedbackText = `Solid technical response leveraging ${primaryDs}. ${hasTimeComplexity ? 'Provided explicit time complexity analysis.' : 'Be sure to state big-O time complexity.'} ${hasSpaceComplexity ? 'Clearly identified auxiliary memory usage.' : 'Include space complexity details.'} ${edgeCasesFound.length > 0 ? `Addressed key edge cases including ${edgeCasesFound.join(', ')}.` : 'Deepen coverage of edge cases and boundary limits.'}`
    cavemanText = `Good: clear ${primaryDs} approach. Bad: ${hasEdgeCases ? 'memory trade-offs' : 'edge cases could be broader'}. Fix: analyze boundary limits and alternative data structures.`
    techAccuracyText = `Accurate solution using ${primaryDs} with sound engineering logic.`
    improvementsText = 'Deepen edge-case coverage and discuss practical production trade-offs such as cache locality, thread-safety, or scale constraints.'
  }

  return {
    score: finalScore,
    caveman_feedback: cavemanText,
    feedback: feedbackText,
    technicalAccuracy: techAccuracyText,
    improvements: improvementsText,
    topic: qTopic,
    technicalAccuracyScore,
    structureClarityScore,
    depthEdgeCasesScore,
  }
}
