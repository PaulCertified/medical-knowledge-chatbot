export interface KnowledgeBase {
  id: string;
  content: string;
  metadata: {
    title?: string;
    source?: string;
    author?: string;
    date?: string;
    tags?: string[];
    [key: string]: any;
  };
  embedding?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult {
  document: KnowledgeBase;
  score: number;
}

export interface BulkAddResult {
  successful: number;
  failed: number;
  errors: Error[];
} 