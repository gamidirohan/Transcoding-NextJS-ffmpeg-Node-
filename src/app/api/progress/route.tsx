// app/api/progress/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const response = await axios.get('http://localhost:5000/progress');
    return NextResponse.json(response.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ progress: 0 });
  }
}
