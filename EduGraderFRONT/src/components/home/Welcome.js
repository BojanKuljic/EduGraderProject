import React from "react";
import "../../styles/home/Welcome.css"; // napravi i ovaj ako želiš stil

const Welcome = () => {
  return (
    <div className="welcome-container">
      <h1>Dobrodošli na EduGrader Web API</h1>
      <p className="intro">
        EduGrader je sistem za automatsku analizu i ocenjivanje edukativnih radova –
        kao što su eseji, projektni zadaci i kodovi – korišćenjem mikroservisne
        arhitekture i veštačke inteligencije.
      </p>
      <p className="description">
        Sistem omogućava:
        <ul>
          <li>📤 Postavljanje radova i verzionisanje</li>
          <li>🤖 Automatsku analizu sadržaja (ocena, greške, preporuke)</li>
          <li>📊 Praćenje napretka kroz grafike i statistike</li>
          <li>👨‍🏫 Pregled i dodatne komentare profesora</li>
          <li>🛠 Administraciju korisnika i sistemskih pravila</li>
        </ul>
      </p>
      <p className="roles">
        👥 Sistem ima tri vrste korisnika:
        <ul>
          <li><strong>Studenti</strong> – postavljaju radove i prate svoj napredak</li>
          <li><strong>Profesori</strong> – pregledaju, ocenjuju i komentarišu radove</li>
          <li><strong>Administratori</strong> – upravljaju korisnicima i podešavanjima sistema</li>
        </ul>
      </p>
      <p className="footer-note">
        🔐 Prijavite se ili napravite nalog da biste koristili sistem.
      </p>
    </div>
  );
};

export default Welcome;
