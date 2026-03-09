import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '../../../lib/database';
import { CalculationHistory } from '../../../entities/CalculationHistory';

export async function GET() {
  try {
    const ds = await getDataSource();
    const repo = ds.getRepository(CalculationHistory);
    const history = await repo.find({
      order: { createdAt: 'DESC' },
      take: 50,
    });
    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { expression, result } = body;

    if (!expression || result === undefined) {
      return NextResponse.json({ error: 'Expression and result are required' }, { status: 400 });
    }

    const ds = await getDataSource();
    const repo = ds.getRepository(CalculationHistory);

    const entry = repo.create({ expression, result: String(result) });
    const saved = await repo.save(entry);

    return NextResponse.json({ entry: saved }, { status: 201 });
  } catch (error) {
    console.error('Error saving history:', error);
    return NextResponse.json({ error: 'Failed to save history' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const ds = await getDataSource();
    const repo = ds.getRepository(CalculationHistory);
    await repo.clear();
    return NextResponse.json({ message: 'History cleared' });
  } catch (error) {
    console.error('Error clearing history:', error);
    return NextResponse.json({ error: 'Failed to clear history' }, { status: 500 });
  }
}
