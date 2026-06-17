/**
 * Firebase Mocks para testes automatizados (Vitest).
 *
 * Uso em testes:
 *
 *   import { vi } from 'vitest'
 *   import {
 *     mockGetDocs, mockGetDoc, mockAddDoc, mockRunTransaction,
 *     mockQuerySnapshot, resetFirebaseMocks, simulateFirebaseError
 *   } from '@/test/mocks/firebase'
 *
 *   vi.mock('firebase/app',     () => ({ initializeApp: vi.fn(() => ({})) }))
 *   vi.mock('firebase/auth',    () => import('@/test/mocks/firebase').then(m => m.authExports)))
 *   vi.mock('firebase/firestore', () => import('@/test/mocks/firebase').then(m => m.firestoreExports)))
 *   vi.mock('firebase/storage', () => import('@/test/mocks/firebase').then(m => m.storageExports)))
 *
 * Para simular erros:
 *   simulateFirebaseError('firestore')  // faz getDocs, getDoc, etc. rejeitarem
 *   resetFirebaseMocks()                // restaura comportamento padrão (sucesso)
 */

import { vi } from 'vitest'

// ============================================================
// FIRESTORE MOCKS
// ============================================================

// --- Documentos e Snapshots ---

/** DocumentReference simulado — retornado por doc() */
export const mockDocRef = { id: 'mock-doc-id', path: 'collection/mock-doc-id' }

/** DocumentSnapshot simulado — retornado por transaction.get() e getDoc() */
export const mockDocumentSnapshot = {
  exists: vi.fn(() => true),
  data: vi.fn(() => ({})),
  id: 'mock-doc-id',
}

/** DocumentReference retornado por addDoc() */
export const mockAddDocRef = { id: 'new-doc-id' }

// --- Queries e Snapshots de coleção ---

/** CollectionReference simulado — retornado por collection() */
export const mockCollectionRef = { type: 'collection', path: 'mock-collection' }

/** Query simulado — retornado por query() */
export const mockQueryRef = { type: 'query' }

/** QuerySnapshot simulado — retornado por getDocs().
 *  O array de docs é configurável via mockGetDocs.mockReturnValue(...) */
export const mockQuerySnapshot = {
  docs: [] as Array<{ id: string; data: () => unknown }>,
  forEach: vi.fn(function (this: { docs: Array<{ id: string; data: () => unknown }> }, cb: (doc: { id: string; data: () => unknown }) => void) {
    this.docs.forEach(cb)
  }),
  empty: true,
  size: 0,
}

// --- Transaction ---

/** TransactionDocumentSnapshot — retornado por transaction.get() dentro de runTransaction */
export const mockTransactionDoc = {
  exists: vi.fn(() => true),
  data: vi.fn(() => ({ semanas: {}, pontuacaoTotal: 0 })),
}

/** Transaction object — passado como argumento ao callback de runTransaction */
export const mockTransaction = {
  get: vi.fn(),
  update: vi.fn(() => Promise.resolve()),
  set: vi.fn(() => Promise.resolve()),
  delete: vi.fn(() => Promise.resolve()),
}

// --- Mock Functions (vi.fn) ---

export const mockGetDocs = vi.fn(() => Promise.resolve(mockQuerySnapshot))
export const mockGetDoc = vi.fn(() => Promise.resolve(mockDocumentSnapshot))
export const mockAddDoc = vi.fn(() => Promise.resolve(mockAddDocRef))
export const mockSetDoc = vi.fn(() => Promise.resolve())
export const mockUpdateDoc = vi.fn(() => Promise.resolve())
export const mockDeleteDoc = vi.fn(() => Promise.resolve())

export const mockCollection = vi.fn(() => mockCollectionRef)
export const mockDoc = vi.fn(() => mockDocRef)
export const mockQuery = vi.fn(() => mockQueryRef)
export const mockWhere = vi.fn(() => ({ type: 'where' }))
export const mockOrderBy = vi.fn(() => ({ type: 'orderBy' }))

/**
 * runTransaction mock — executa o callback com mockTransaction.
 * Por padrão, mockTransaction.get retorna mockTransactionDoc (configurável pelo teste).
 */
export const mockRunTransaction = vi.fn(
  async (_db: unknown, updateFn: (transaction: typeof mockTransaction) => Promise<unknown>) => {
    mockTransaction.get.mockResolvedValue(mockTransactionDoc)
    return updateFn(mockTransaction)
  }
)

// ============================================================
// AUTH MOCKS
// ============================================================

export const mockUser = {
  uid: 'mock-uid-123',
  email: 'test@example.com',
  displayName: 'Test User',
}

export const mockAuth = { currentUser: mockUser }

export const mockGetAuth = vi.fn(() => mockAuth)
export const mockSignInWithEmailAndPassword = vi.fn(() =>
  Promise.resolve({ user: mockUser })
)
export const mockSignOut = vi.fn(() => Promise.resolve())
export const mockOnAuthStateChanged = vi.fn(
  (_auth: unknown, callback: (user: unknown) => void) => {
    callback(mockUser)
    return vi.fn() // unsubscribe
  }
)

// ============================================================
// STORAGE MOCKS
// ============================================================

export const mockStorageRef = { fullPath: 'casais/mock/foto.jpg' }
export const mockUploadResult = { ref: mockStorageRef }

export const mockGetStorage = vi.fn(() => ({}))
export const mockRef = vi.fn(() => mockStorageRef)
export const mockUploadBytes = vi.fn(() => Promise.resolve(mockUploadResult))
export const mockGetDownloadURL = vi.fn(() =>
  Promise.resolve('https://mock-storage.example.com/foto.jpg')
)
export const mockDeleteObject = vi.fn(() => Promise.resolve())

// ============================================================
// APP MOCK
// ============================================================

export const mockInitializeApp = vi.fn(() => ({}))

// ============================================================
// EXPORT AGRUPADOS (para vi.mock factories)
// ============================================================

export const firestoreExports = {
  getFirestore: vi.fn(() => ({})),
  collection: mockCollection,
  doc: mockDoc,
  getDoc: mockGetDoc,
  setDoc: mockSetDoc,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  addDoc: mockAddDoc,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  getDocs: mockGetDocs,
  runTransaction: mockRunTransaction,
}

export const authExports = {
  getAuth: mockGetAuth,
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  signOut: mockSignOut,
  onAuthStateChanged: mockOnAuthStateChanged,
}

export const storageExports = {
  getStorage: mockGetStorage,
  ref: mockRef,
  uploadBytes: mockUploadBytes,
  getDownloadURL: mockGetDownloadURL,
  deleteObject: mockDeleteObject,
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Restaura todos os mocks para o comportamento padrão (sucesso).
 * Chamar no beforeEach() de cada suíte de testes.
 */
export function resetFirebaseMocks(): void {
  // Firestore
  mockGetDocs.mockResolvedValue(mockQuerySnapshot)
  mockGetDoc.mockResolvedValue(mockDocumentSnapshot)
  mockAddDoc.mockResolvedValue(mockAddDocRef)
  mockSetDoc.mockResolvedValue(undefined)
  mockUpdateDoc.mockResolvedValue(undefined)
  mockDeleteDoc.mockResolvedValue(undefined)

  mockCollection.mockReturnValue(mockCollectionRef)
  mockDoc.mockReturnValue(mockDocRef)
  mockQuery.mockReturnValue(mockQueryRef)
  mockWhere.mockReturnValue({ type: 'where' })
  mockOrderBy.mockReturnValue({ type: 'orderBy' })

  mockDocumentSnapshot.exists.mockReturnValue(true)
  mockDocumentSnapshot.data.mockReturnValue({})
  mockTransactionDoc.exists.mockReturnValue(true)
  mockTransactionDoc.data.mockReturnValue({ semanas: {}, pontuacaoTotal: 0 })

  mockTransaction.get.mockResolvedValue(mockTransactionDoc)
  mockTransaction.update.mockResolvedValue(undefined)

  mockRunTransaction.mockImplementation(
    async (_db: unknown, updateFn: (transaction: typeof mockTransaction) => Promise<unknown>) => {
      mockTransaction.get.mockResolvedValue(mockTransactionDoc)
      return updateFn(mockTransaction)
    }
  )

  // Auth
  mockGetAuth.mockReturnValue(mockAuth)
  mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockUser })
  mockSignOut.mockResolvedValue(undefined)
  mockOnAuthStateChanged.mockImplementation(
    (_auth: unknown, callback: (user: unknown) => void) => {
      callback(mockUser)
      return vi.fn()
    }
  )

  // Storage
  mockGetStorage.mockReturnValue({})
  mockRef.mockReturnValue(mockStorageRef)
  mockUploadBytes.mockResolvedValue(mockUploadResult)
  mockGetDownloadURL.mockResolvedValue('https://mock-storage.example.com/foto.jpg')
  mockDeleteObject.mockResolvedValue(undefined)

  // QuerySnapshot
  mockQuerySnapshot.docs = []
  mockQuerySnapshot.empty = true
  mockQuerySnapshot.size = 0
}

/**
 * Simula erro do Firebase em um módulo específico.
 * Útil para testar caminhos de erro (catch blocks).
 *
 * @example
 * simulateFirebaseError('firestore') // getDocs, getDoc, etc. rejeitam
 * simulateFirebaseError('auth')      // signIn rejeita
 * simulateFirebaseError('storage')   // upload, download rejeitam
 */
export function simulateFirebaseError(
  module: 'firestore' | 'auth' | 'storage'
): void {
  const error = new Error(`Firebase ${module} error (simulated)`)

  if (module === 'firestore') {
    mockGetDocs.mockRejectedValue(error)
    mockGetDoc.mockRejectedValue(error)
    mockAddDoc.mockRejectedValue(error)
    mockSetDoc.mockRejectedValue(error)
    mockUpdateDoc.mockRejectedValue(error)
    mockDeleteDoc.mockRejectedValue(error)
    mockRunTransaction.mockRejectedValue(error)
  }

  if (module === 'auth') {
    mockSignInWithEmailAndPassword.mockRejectedValue(error)
    mockSignOut.mockRejectedValue(error)
  }

  if (module === 'storage') {
    mockUploadBytes.mockRejectedValue(error)
    mockGetDownloadURL.mockRejectedValue(error)
    mockDeleteObject.mockRejectedValue(error)
  }
}
