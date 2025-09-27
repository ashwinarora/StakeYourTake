export async function POST(request: Request) {
  const { title, description } = await request.json();
  const debate = await prisma.debate.create({
    data: { title, description },
  });
  return NextResponse.json(debate);
}