export abstract class Entity {
  protected constructor(private _id: number | null) {}

  get id(): number | null {
    return this._id;
  }

  bindId(id: number): void {
    if (this._id !== null && this._id !== id) {
      throw new Error(`Entity id cannot be changed (current: ${this._id}, new: ${id})`);
    }
    this._id = id;
  }

  get persistedId(): number {
    if (this._id === null) {
      throw new Error('Entity has not been persisted yet and has no id');
    }
    return this._id;
  }

  equals(other: Entity): boolean {
    if (this === other) return true;
    if (this._id === null || other._id === null) return false;
    return this.constructor === other.constructor && this._id === other._id;
  }
}
