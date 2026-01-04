
import { MealEntry, WeightEntry, UserProfile } from '../types';

class MockService {
  private prefix = 'corpus_sanum_';

  private getStore<T>(key: string): T[] {
    const data = localStorage.getItem(this.prefix + key);
    return data ? JSON.parse(data) : [];
  }

  private setStore<T>(key: string, data: T[]) {
    localStorage.setItem(this.prefix + key, JSON.stringify(data));
  }

  async getMeals(userId: UserProfile): Promise<MealEntry[]> {
    const all = this.getStore<MealEntry>('meals');
    return all.filter(m => m.userId === userId).sort((a, b) => b.timestamp - a.timestamp);
  }

  async addMeal(meal: MealEntry): Promise<void> {
    const all = this.getStore<MealEntry>('meals');
    all.push(meal);
    this.setStore('meals', all);
  }

  async getWeights(userId: UserProfile): Promise<WeightEntry[]> {
    const all = this.getStore<WeightEntry>('weights');
    return all.filter(w => w.userId === userId).sort((a, b) => a.timestamp - b.timestamp);
  }

  async addWeight(entry: WeightEntry): Promise<void> {
    const all = this.getStore<WeightEntry>('weights');
    all.push(entry);
    this.setStore('weights', all);
  }

  async getUsedTokens(userId: UserProfile): Promise<number> {
    const data = localStorage.getItem(this.prefix + 'tokens_' + userId);
    return data ? parseInt(data) : 0;
  }

  async updateUsedTokens(userId: UserProfile, count: number): Promise<void> {
    localStorage.setItem(this.prefix + 'tokens_' + userId, count.toString());
  }
}

export const storage = new MockService();
