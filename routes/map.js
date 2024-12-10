var express = require("express");
var router = express.Router();

// Route Post pour rechercher des boutiques 
router.post("/boutiques/:localisation", async (req, res, next) => {
    //Position du user
    const [lat, lon] = req.params.localisation.split(",");
    //Fetch Rechercher les boutiques pour chiens
    try {
        const response = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            body: "data=" + encodeURIComponent(`
                [out:json][timeout:90];
                (
                    node["shop"="pet"](around:100000, ${lat}, ${lon}); 
                    way["shop"="pet"](around:100000, ${lat}, ${lon});
                    relation["shop"="pet"](around:100000, ${lat}, ${lon});
                );
                out body qt;
                >;
                out skel qt;
            `)
        })
        if (!response.ok) {
            throw new Error("Failed to fetch data from Overpass");
        }

        const data = await response.json();
        res.status(200).json({ result: true, data: data });
    } catch (error) {
        console.log("Search error:", error)
        res.status(400).json({ result: false, error: 'Search failed' });
    }
})

//Route Post pour rechercher des veterinaires
router.post("/veterinaires/:localisation", async (req, res, next) => {
    // Position du user
    const [lat, lon] = req.params.localisation.split(",");
    // Fetch Rechercher les vétérinaires
    try {
        const response = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            body: "data=" + encodeURIComponent(`
                [out:json][timeout:90];
                (
                    node["amenity"="veterinary"](around:100000, ${lat}, ${lon});
                    way["amenity"="veterinary"](around:100000, ${lat}, ${lon});
                    relation["amenity"="veterinary"](around:100000, ${lat}, ${lon});
                );
                out body qt;
                >;
                out skel qt;
            `)
        });

        if (!response.ok) {
            throw new Error("Failed to fetch data from Overpass");
        }

        const data = await response.json();
        res.status(200).json({ result: true, data: data });
    } catch (error) {
        console.log("Search error:", error);
        res.status(400).json({ result: false, error: 'Search failed' });
    }
});

//Route post pour recherche les parks 
router.post("/parcs-chiens/:localisation", async (req, res, next) => {
    // Position du user
    const [lat, lon] = req.params.localisation.split(",");

    // Fetch Rechercher les parcs où les chiens sont admis
    try {
        const response = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            body: "data=" + encodeURIComponent(`
                [out:json][timeout:90];
                (
                    node["leisure"="park"]["dog"="yes"](around:100000, ${lat}, ${lon});
                    way["leisure"="park"]["dog"="yes"](around:100000, ${lat}, ${lon});
                    relation["leisure"="park"]["dog"="yes"](around:100000, ${lat}, ${lon});
                );
                out body qt;
                >;
                out skel qt;
            `)
        });

        if (!response.ok) {
            throw new Error("Failed to fetch data from Overpass");
        }

        const data = await response.json();
        res.status(200).json({ result: true, data: data });
    } catch (error) {
        console.log("Search error:", error);
        res.status(400).json({ result: false, error: 'Search failed' });
    }
});

// Route pour trouver des lieux avec des mots clés
router.post("/recherche/:localisation", async (req, res, next) => {
    // Position du user
    const [lat, lon] = req.params.localisation.split(",");
    const { keyword, type } = req.body; // Mot-clé et type (parc, vétérinaire, boutique)

    // Construction de la requête en fonction du type et du mot-clé
    let query = "";
    if (type === "veterinaire") {
        query = `
            [out:json][timeout:90];
            (
                node["amenity"="veterinary"]["name"~"${keyword}",i](around:5000, ${lat}, ${lon});
                way["amenity"="veterinary"]["name"~"${keyword}",i](around:5000, ${lat}, ${lon});
                relation["amenity"="veterinary"]["name"~"${keyword}",i](around:5000, ${lat}, ${lon});
            );
            out body qt;
            >;
            out skel qt;
        `;
    } else if (type === "parc") {
        query = `
            [out:json][timeout:90];
            (
                node["leisure"="park"]["dog"="yes"]["name"~"${keyword}",i](around:5000, ${lat}, ${lon});
                way["leisure"="park"]["dog"="yes"]["name"~"${keyword}",i](around:5000, ${lat}, ${lon});
                relation["leisure"="park"]["dog"="yes"]["name"~"${keyword}",i](around:5000, ${lat}, ${lon});
            );
            out body qt;
            >;
            out skel qt;
        `;
    } else if (type === "boutique") {
        query = `
            [out:json][timeout:90];
            (
                node["shop"="pet"]["name"~"${keyword}",i](around:5000, ${lat}, ${lon});
                way["shop"="pet"]["name"~"${keyword}",i](around:5000, ${lat}, ${lon});
                relation["shop"="pet"]["name"~"${keyword}",i](around:5000, ${lat}, ${lon});
            );
            out body qt;
            >;
            out skel qt;
        `;
    } else {
        return res.status(400).json({ result: false, error: 'Invalid type provided' });
    }

    // Fetch les données en fonction du type et du mot-clé
    try {
        const response = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            body: "data=" + encodeURIComponent(query),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch data from Overpass");
        }

        const data = await response.json();
        res.status(200).json({ result: true, data: data });
    } catch (error) {
        console.log("Search error:", error);
        res.status(400).json({ result: false, error: 'Search failed' });
    }
});

module.exports = router;