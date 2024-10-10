class DeltagerManager {
        #startnr
        #deltakernavn
        #deltakertid

        #deltakere = {}

        #outputElm
        #nedre
        #ovre
        #liste
        #ingenRes

    constructor(root) {
        this.#startnr = root.querySelector("#startnummer");
        this.#deltakernavn = root.querySelector("#deltagernavn");
        this.#deltakertid = root.querySelector("#sluttid");
        this.#outputElm = root.querySelector("p.hidden");
        this.#nedre = root.querySelector("#nedregrense");
        this.#ovre = root.querySelector("#ovregrense");
        this.#liste = root.querySelector("div.liste tbody")
        this.#ingenRes = root.querySelector("div.liste p")

        const knappRegistrer = root.querySelector("fieldset.registrering button");
        const knappVis = root.querySelector("fieldset.resultat button");
        knappRegistrer.addEventListener("click", () => this.#registrer());
        knappVis.addEventListener("click", () => this.#vis());

    }
    #registrer() {

        let nummer = this.#startnr.value;
        let navn = this.#deltakernavn.value;
        let tid = this.#deltakertid.value;

        if (!this.#validityReg(nummer, navn, tid)) {
            return;
        }
        navn = this.#navnFormater(navn);
        this.#deltakere[nummer] = {startnr: nummer, deltakernavn: navn, deltakertid: tid};

        this.#startnr.value = "";
        this.#deltakernavn.value = "";
        this.#deltakertid.value = "";
        this.#deltakertid.focus();

        const outputElm = this.#outputElm.querySelectorAll("span");
        outputElm[0].innerText = navn;
        outputElm[1].innerText = nummer;
        outputElm[2].innerText = tid;
        this.#outputElm.classList.remove("hidden");
    }

    #vis() {
        const fra = this.#nedre.value;
        const til = this.#ovre.value;

        if (!this.#validityVis(fra, til)) {
            return;
        }
        this.#liste.innerHTML = "";


        let deltakere = Object.entries(this.#deltakere);

        if (!deltakere.length) {
            this.#ingenRes.classList.remove("hidden");
            return;
        }

        let resultatListe = deltakere
            .sort(([, a], [, b]) => a.deltakertid.localeCompare(b.deltakertid))
            .map(([, deltaker], i) => ({
                plassering: i + 1,
                deltaker,
            }))
            .filter(({ deltaker }) =>
                (!fra || deltaker.deltakertid >= fra) &&
                (!til || deltaker.deltakertid <= til)
            );


        if (!resultatListe.length) {
            this.#ingenRes.classList.remove("hidden");
            return;
        }
        this.#ingenRes.classList.add("hidden");


        resultatListe.forEach(({ plassering, deltaker: { startnr, deltakernavn, deltakertid } }) => {
            const r = document.createElement("tr");

            // Legg til celler for plassering, startnummer, navn og sluttid
            [plassering, startnr, deltakernavn, deltakertid].forEach(innhold => {
                const data = document.createElement("td");
                data.innerText = innhold;
                r.appendChild(data);
            });

            this.#liste.appendChild(r);
        });
    }

    #validityReg(nummer, navn, tid) {
        if (nummer === "") {
            this.#startnr.setCustomValidity("Startnummer må fylles ut");
            this.#startnr.reportValidity();
            this.#startnr.focus();
            return false;
        }

        if (navn.length < 2) {
            this.#deltakernavn.setCustomValidity("Navn må ha minst 2 bokstaver");
            this.#deltakernavn.reportValidity();
            this.#deltakernavn.focus();
            return false;
        }

        if (tid === "") {
            this.#deltakertid.setCustomValidity("Sluttid må fylles ut");
            this.#deltakertid.reportValidity();
            this.#deltakertid.focus();
            return false;
        }

        if (nummer in this.#deltakere) {
            this.#startnr.setCustomValidity("Dette startnummeret er allerede registrert");
            this.#startnr.reportValidity();
            this.#startnr.focus();
            return false;
        }

        if (!(/^\p{L}{2,}(?:[\s-]\p{L}{2,})*$/u).test(navn)) {
            this.#deltakernavn.setCustomValidity("Deltakernavnet har ikke tillate tegn, eller starter med mellomrom");
            this.#deltakernavn.reportValidity();
            this.#deltakernavn.focus();
            return false;
        }

        this.#startnr.setCustomValidity("");
        this.#deltakernavn.setCustomValidity("");
        this.#deltakertid.setCustomValidity("");
        return true;
    }

    #navnFormater(navn) {
        return navn
            .toLowerCase()
            .replace(/\b\w/g, char => char.toUpperCase());
    }

    #validityVis(fra, til) {

        if (fra === "") {
            this.#nedre.setCustomValidity("Fra tid mangler");
            this.#nedre.title = "Fra tid mangler";
            this.#nedre.reportValidity();
            this.#nedre.focus();
            return false;
        }

        if (til === "") {
            this.#ovre.setCustomValidity("til tid mangler");
            this.#ovre.title = "til tid mangler";
            this.#ovre.reportValidity();
            this.#ovre.focus();
            return false;
        }

        if (fra > til) {
            this.#ovre.setCustomValidity("Til-tiden kan ikke være tidligere enn fra-tiden");
            this.#ovre.title = "Til-tiden kan ikke være tidligere enn fra-tiden";
            this.#ovre.reportValidity();
            this.#ovre.focus();
            return false;
        }

        this.#ovre.setCustomValidity("");
        this.#ovre.title = "";
        this.#nedre.setCustomValidity("");
        this.#nedre.title = "";
        return true;
    }

}



const rootelement = document.getElementById("root");
new DeltagerManager(rootelement);