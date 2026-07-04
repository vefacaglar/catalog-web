/**
 * Kimliği DB tarafından (identity kolonu) atanan entity tabanı.
 * Yeni oluşturulan aggregate'lerde id, persist edilene kadar null'dır.
 */
export abstract class Entity {
  protected constructor(private _id: number | null) {}

  get id(): number | null {
    return this._id;
  }

  /** Persist sonrası DB'nin atadığı kimliği bağlar; yalnızca repository çağırır. */
  bindId(id: number): void {
    if (this._id !== null && this._id !== id) {
      throw new Error(`Entity kimliği değiştirilemez (mevcut: ${this._id}, yeni: ${id})`);
    }
    this._id = id;
  }

  get persistedId(): number {
    if (this._id === null) {
      throw new Error('Entity henüz persist edilmedi, kimliği yok');
    }
    return this._id;
  }

  equals(other: Entity): boolean {
    if (this === other) return true;
    if (this._id === null || other._id === null) return false;
    return this.constructor === other.constructor && this._id === other._id;
  }
}
