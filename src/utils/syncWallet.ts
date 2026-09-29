const SYNC_KEY = "card_sync_id";

// 1. 현재 기기의 Sync ID 가져오기 (없으면 새로 생성)
export function getOrCreateSyncId(): string {
  let id = localStorage.getItem(SYNC_KEY);
  if (!id) {
    id = "sync_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    localStorage.setItem(SYNC_KEY, id);
  }
  return id;
}

// 2. 다른 기기의 Sync ID로 덮어쓰고 D1에서 최신 보관함 가져오기
export async function pullWalletFromEdge(syncId: string): Promise<any[] | null> {
  try {
    const res = await fetch(`/api/sync?id=${syncId}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.cards)) {
      localStorage.setItem(SYNC_KEY, syncId);
      return data.cards;
    }
  } catch (err) {
    console.error("Failed to pull wallet from edge:", err);
  }
  return null;
}

// 3. 현재 로컬 보관함 목록을 D1으로 백그라운드 동기화 (디바운스 처리 가능)
export async function pushWalletToEdge(cards: any[]): Promise<void> {
  const syncId = getOrCreateSyncId();
  try {
    await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ syncId, cards }),
    });
  } catch (err) {
    console.error("Failed to push wallet to edge:", err);
  }
}