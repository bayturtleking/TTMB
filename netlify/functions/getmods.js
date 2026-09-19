exports.handler = async function (event) {
  const urltouse = 'https://thunderstore.io/c/totally-accurate-battle-simulator/api/v1/package/';
  try {
    const res = await fetch(urltouse, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TABS-Mod-Site/1.0; +https://tabs.turtlewave.dev)',
        'Accept': 'application/json'
      }
    });
    if (!res.ok) {
      const textfromthing = await res.text().catch(() => '');
      console.error('thunderstore fetch failed', res.status, textfromthing.slice(0, 500));
      return {
        statusCode: res.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store'
        },
        body: JSON.stringify({
          error: `thunderstore mods ${res.status}`
        })
      };
    }
    const json = await res.json();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify(json)
    };
  } catch (error) {
    console.error('get mods threwww ', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({
        error: 'couldnt get thunderstore mods'
      })
    };
  }
};