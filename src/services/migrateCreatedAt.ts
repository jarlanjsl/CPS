import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Migração única: adiciona campo createdAt às turmas existentes.
 * Executar apenas uma vez via console do navegador.
 */
export async function migrateCreatedAt() {
  if (!db) {
    console.error('DB não inicializado.');
    return;
  }

  try {
    // Busca turmas sem createdAt
    const turmasRef = collection(db!, 'turmas');
    const snapshot = await getDocs(turmasRef);

    let count = 0;
    const updates: Promise<void>[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (!data.createdAt) {
        // Usa dataInicio como fallback, ou data atual
        const createdAt = data.dataInicio
          ? new Date(data.dataInicio).toISOString()
          : new Date().toISOString();

        const turmaRef = doc(db!, 'turmas', docSnap.id);
        updates.push(updateDoc(turmaRef, { createdAt }));
        count++;
      }
    });

    await Promise.all(updates);
    console.log(`Migração concluída: ${count} turmas atualizadas com createdAt.`);

    if (count === 0) {
      console.log('Nenhuma turma precisou de migração.');
    }
  } catch (e) {
    console.error('Erro durante a migração:', e);
  }
}
