import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Siapkan data untuk RajaOngkir
    const params = new URLSearchParams();
    params.append("origin", body.origin);
    params.append("destination", body.destination);
    params.append("weight", body.weight);
    params.append("courier", body.courier);

    const response = await fetch("https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost", {
      method: "POST",
      headers: {
        "key": "eYx6nX5y6a507b7f71240fcd1kjdEf7x",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Gagal fetch ke RajaOngkir" }, { status: 500 });
  }
}