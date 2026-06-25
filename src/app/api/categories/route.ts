import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: { where: { isAvailable: true } } } } },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, image, sortOrder } = body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const category = await db.category.create({
      data: {
        name,
        slug,
        image: image || '',
        sortOrder: parseInt(sortOrder) || 0,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    const category = await db.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name, slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.sortOrder !== undefined && { sortOrder: parseInt(data.sortOrder) }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Category ID required' }, { status: 400 });

    await db.product.deleteMany({ where: { categoryId: id } });
    await db.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}