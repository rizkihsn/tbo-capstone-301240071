import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Bookmark {
  id: string;
  type: 'FSA' | 'PDA' | 'REGEX' | 'CFG';
  name: string;
  data: any;
}

interface BookmarkStore {
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Omit<Bookmark, 'id'>) => void;
  removeBookmark: (id: string) => void;
}

// Pre-defined templates
export const DEFAULT_TEMPLATES: Bookmark[] = [
  {
    id: 'tpl_fsa_1',
    type: 'FSA',
    name: 'Berakhiran 11 (DFA)',
    data: {
      mode: 'DFA',
      states: ["q0", "q1", "q2"],
      alphabet: ["0", "1"],
      startState: "q0",
      finalStates: ["q2"],
      transitions: [
        { from: "q0", to: "q0", symbol: "0" },
        { from: "q0", to: "q1", symbol: "1" },
        { from: "q1", to: "q0", symbol: "0" },
        { from: "q1", to: "q2", symbol: "1" },
        { from: "q2", to: "q0", symbol: "0" },
        { from: "q2", to: "q2", symbol: "1" }
      ]
    }
  },
  {
    id: 'tpl_regex_1',
    type: 'REGEX',
    name: 'Email Sederhana',
    data: { regex: "(a|b|c)*@(g|y)*.com" }
  },
  {
    id: 'tpl_pda_1',
    type: 'PDA',
    name: 'Bahasa a^n b^n',
    data: {
      states: ["q0", "q1", "q2"],
      inputAlphabet: ["a", "b"],
      stackAlphabet: ["A", "Z"],
      startState: "q0",
      initialStackSymbol: "Z",
      finalStates: ["q2"],
      transitions: [
        { from: "q0", to: "q0", input: "a", pop: "Z", push: ["A", "Z"] },
        { from: "q0", to: "q0", input: "a", pop: "A", push: ["A", "A"] },
        { from: "q0", to: "q1", input: "b", pop: "A", push: ["ε"] },
        { from: "q1", to: "q1", input: "b", pop: "A", push: ["ε"] },
        { from: "q1", to: "q2", input: "ε", pop: "Z", push: ["Z"] },
      ]
    }
  }
];

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set) => ({
      bookmarks: [...DEFAULT_TEMPLATES],
      addBookmark: (bookmark) => set((state) => ({
        bookmarks: [...state.bookmarks, { ...bookmark, id: Date.now().toString() }]
      })),
      removeBookmark: (id) => set((state) => ({
        bookmarks: state.bookmarks.filter((b) => b.id !== id)
      }))
    }),
    {
      name: 'automata-bookmarks-storage',
    }
  )
);
