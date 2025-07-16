#!/usr/bin/env python3

import os
import sys
import time
from generate_questions import generate_questions, add_questions_to_database


def generate_batch():
    """
    Generate a batch of questions across multiple categories and difficulties.
    """

    categories = [
        ("Sports - Soccer", 10),
        ("Sports - Soccer  - International Competitions", 10),
        (
            "Sports - Football - International Competitions - FIFA World Cup - Winners",
            10,
        ),
        (
            "Sports - Football - International Competitions - FIFA World Cup - Records",
            10,
        ),
        (
            "Sports - Football - International Competitions - FIFA Women's World Cup - Winners",
            3,
        ),
        (
            "Sports - Football - International Competitions - FIFA Women's World Cup - Records",
            3,
        ),
        (
            "Sports - Football - International Competitions - UEFA European Championship (Euros) - Winners",
            10,
        ),
        (
            "Sports - Football - International Competitions - UEFA European Championship (Euros) - Records",
            3,
        ),
        ("Sports - Football - International Competitions - Copa América - Winners", 3),
        ("Sports - Football - International Competitions - Copa América - Records", 3),
        (
            "Sports - Football - International Competitions - Africa Cup of Nations (AFCON) - Winners",
            6,
        ),
        (
            "Sports - Football - International Competitions - Africa Cup of Nations (AFCON) - Records",
            6,
        ),
        ("Sports - Football - International Competitions - AFC Asian Cup - Winners", 5),
        ("Sports - Football - International Competitions - AFC Asian Cup - Records", 3),
        (
            "Sports - Football - International Competitions - UEFA Nations League - Winners",
            5,
        ),
        (
            "Sports - Football - International Competitions - UEFA Nations League - Records",
            3,
        ),
        (
            "Sports - Football - International Competitions - CONCACAF Gold Cup - Winners",
            3,
        ),
        (
            "Sports - Football - International Competitions - CONCACAF Gold Cup - Records",
            3,
        ),
        ("Sports - Football - Club Competitions", 3),
        ("Sports - Football - Club Competitions - UEFA Champions League - Winners", 10),
        ("Sports - Football - Club Competitions - UEFA Champions League - Records", 10),
        ("Sports - Football - Club Competitions - UEFA Europa League - Winners", 7),
        ("Sports - Football - Club Competitions - UEFA Europa League - Records", 7),
        ("Sports - Football - Club Competitions - UEFA Conference League - Winners", 3),
        ("Sports - Football - Club Competitions - UEFA Conference League - Records", 3),
        (
            "Sports - Football - Club Competitions - UEFA Women's Champions League - Winners",
            3,
        ),
        (
            "Sports - Football - Club Competitions - UEFA Women's Champions League - Records",
            3,
        ),
        ("Sports - Football - Club Competitions - Copa Libertadores - Winners", 3),
        ("Sports - Football - Club Competitions - Copa Libertadores - Records", 3),
        ("Sports - Football - Club Competitions - Copa Sudamericana - Winners", 3),
        ("Sports - Football - Club Competitions - Copa Sudamericana - Records", 3),
        ("Sports - Football - Club Competitions - FIFA Club World Cup - Winners", 10),
        ("Sports - Football - Club Competitions - FIFA Club World Cup - Records", 10),
        ("Sports - Football - English Football", 10),
        ("Sports - Football - English Football - Premier League", 10),
        ("Sports - Football - English Football - Premier League - Arsenal FC", 10),
        ("Sports - Football - English Football - Premier League - Aston Villa", 3),
        (
            "Sports - Football - English Football - Premier League - Brighton & Hove Albion",
            3,
        ),
        ("Sports - Football - English Football - Premier League - Chelsea FC", 10),
        ("Sports - Football - English Football - Premier League - Crystal Palace", 3),
        ("Sports - Football - English Football - Premier League - Everton", 3),
        ("Sports - Football - English Football - Premier League - Fulham", 3),
        ("Sports - Football - English Football - Premier League - Ipswich Town", 3),
        ("Sports - Football - English Football - Premier League - Leicester City", 3),
        ("Sports - Football - English Football - Premier League - Liverpool FC", 10),
        ("Sports - Football - English Football - Premier League - Manchester City", 10),
        (
            "Sports - Football - English Football - Premier League - Manchester United",
            10,
        ),
        ("Sports - Football - English Football - Premier League - Newcastle United", 3),
        (
            "Sports - Football - English Football - Premier League - Nottingham Forest",
            3,
        ),
        ("Sports - Football - English Football - Premier League - Southampton", 3),
        (
            "Sports - Football - English Football - Premier League - Tottenham Hotspur",
            10,
        ),
        ("Sports - Football - English Football - Premier League - West Ham United", 3),
        (
            "Sports - Football - English Football - Premier League - Wolverhampton Wanderers",
            3,
        ),
        (
            "Sports - Football - English Football - Premier League - Player Statistics",
            10,
        ),
        ("Sports - Football - English Football - Premier League - Team Statistics", 10),
        (
            "Sports - Football - English Football - Premier League - Records & Achievements",
            10,
        ),
        (
            "Sports - Football - English Football - Premier League - Transfers Records",
            10,
        ),
        ("Sports - Football - English Football - Premier League - Manager Records", 10),
        ("Sports - Football - English Football - Championship - Winners", 3),
        ("Sports - Football - English Football - Championship - Records", 3),
        ("Sports - Football - English Football - FA Cup - Winners", 10),
        ("Sports - Football - English Football - FA Cup - Records", 10),
        (
            "Sports - Football - English Football - League Cup (Carabao Cup) - Winners",
            3,
        ),
        (
            "Sports - Football - English Football - League Cup (Carabao Cup) - Records",
            3,
        ),
        ("Sports - Football - Fantasy Premier League", 10),
        ("Sports - Football - Fantasy Premier League - Player Points Records", 10),
        ("Sports - Football - Fantasy Premier League - Season Records", 10),
        ("Sports - Football - Fantasy Premier League - Gameweek Records", 10),
        ("Sports - Football - Spanish Football", 10),
        ("Sports - Football - Spanish Football - La Liga - Winners", 10),
        ("Sports - Football - Spanish Football - La Liga - Records", 10),
        ("Sports - Football - Spanish Football - La Liga - Athletic Bilbao", 3),
        ("Sports - Football - Spanish Football - La Liga - Atlético Madrid", 10),
        ("Sports - Football - Spanish Football - La Liga - FC Barcelona", 10),
        ("Sports - Football - Spanish Football - La Liga - Real Betis", 3),
        ("Sports - Football - Spanish Football - La Liga - Real Madrid", 10),
        ("Sports - Football - Spanish Football - La Liga - Real Sociedad", 3),
        ("Sports - Football - Spanish Football - La Liga - Sevilla FC", 3),
        ("Sports - Football - Spanish Football - La Liga - Valencia CF", 3),
        ("Sports - Football - Spanish Football - La Liga - Villarreal CF", 3),
        ("Sports - Football - Spanish Football - Copa del Rey - Winners", 3),
        ("Sports - Football - Spanish Football - Copa del Rey - Records", 3),
        ("Sports - Football - German Football", 3),
        ("Sports - Football - German Football - Bundesliga - Winners", 5),
        ("Sports - Football - German Football - Bundesliga - Records", 5),
        ("Sports - Football - German Football - Bundesliga - Bayer 04 Leverkusen", 3),
        ("Sports - Football - German Football - Bundesliga - Bayern Munich", 6),
        ("Sports - Football - German Football - Bundesliga - Borussia Dortmund", 5),
        (
            "Sports - Football - German Football - Bundesliga - Borussia Mönchengladbach",
            3,
        ),
        ("Sports - Football - German Football - Bundesliga - Eintracht Frankfurt", 3),
        ("Sports - Football - German Football - Bundesliga - RB Leipzig", 3),
        ("Sports - Football - German Football - DFB-Pokal - Winners", 3),
        ("Sports - Football - German Football - DFB-Pokal - Records", 3),
        ("Sports - Football - Italian Football", 10),
        ("Sports - Football - Italian Football - Serie A - Winners", 7),
        ("Sports - Football - Italian Football - Serie A - Records", 6),
        ("Sports - Football - Italian Football - Serie A - AC Milan", 6),
        ("Sports - Football - Italian Football - Serie A - AS Roma", 6),
        ("Sports - Football - Italian Football - Serie A - Atalanta", 3),
        ("Sports - Football - Italian Football - Serie A - Fiorentina", 3),
        ("Sports - Football - Italian Football - Serie A - Inter Milan", 6),
        ("Sports - Football - Italian Football - Serie A - Juventus", 7),
        ("Sports - Football - Italian Football - Serie A - Lazio", 3),
        ("Sports - Football - Italian Football - Serie A - Napoli", 3),
        ("Sports - Football - Italian Football - Coppa Italia - Winners", 3),
        ("Sports - Football - Italian Football - Coppa Italia - Records", 3),
        ("Sports - Football - French Football", 3),
        ("Sports - Football - French Football - Ligue 1 - Winners", 3),
        ("Sports - Football - French Football - Ligue 1 - Records", 3),
        ("Sports - Football - French Football - Ligue 1 - AS Monaco", 3),
        ("Sports - Football - French Football - Ligue 1 - Lille OSC", 3),
        ("Sports - Football - French Football - Ligue 1 - Olympique Lyonnais", 3),
        ("Sports - Football - French Football - Ligue 1 - Olympique de Marseille", 3),
        ("Sports - Football - French Football - Ligue 1 - Paris Saint-Germain", 3),
        ("Sports - Football - Other European Leagues", 3),
        (
            "Sports - Football - Other European Leagues - Eredivisie (Netherlands) - Winners",
            3,
        ),
        (
            "Sports - Football - Other European Leagues - Eredivisie (Netherlands) - Records",
            3,
        ),
        ("Sports - Football - Other European Leagues - Eredivisie - AFC Ajax", 3),
        ("Sports - Football - Other European Leagues - Eredivisie - Feyenoord", 3),
        ("Sports - Football - Other European Leagues - Eredivisie - PSV Eindhoven", 3),
        (
            "Sports - Football - Other European Leagues - Primeira Liga (Portugal) - Winners",
            3,
        ),
        (
            "Sports - Football - Other European Leagues - Primeira Liga (Portugal) - Records",
            3,
        ),
        ("Sports - Football - Other European Leagues - Primeira Liga - SL Benfica", 3),
        ("Sports - Football - Other European Leagues - Primeira Liga - FC Porto", 3),
        ("Sports - Football - Other European Leagues - Primeira Liga - Sporting CP", 3),
        (
            "Sports - Football - Other European Leagues - Scottish Premiership - Winners",
            3,
        ),
        (
            "Sports - Football - Other European Leagues - Scottish Premiership - Records",
            3,
        ),
        (
            "Sports - Football - Other European Leagues - Scottish Premiership - Celtic FC",
            3,
        ),
        (
            "Sports - Football - Other European Leagues - Scottish Premiership - Rangers FC",
            3,
        ),
        (
            "Sports - Football - Other European Leagues - Süper Lig (Turkey) - Winners",
            3,
        ),
        (
            "Sports - Football - Other European Leagues - Süper Lig (Turkey) - Records",
            3,
        ),
        ("Sports - Soccer - Players", 10),
        ("Sports - Soccer - Players - Legends - Career Records", 10),
        ("Sports - Football - Players - Legends - Pelé", 3),
        ("Sports - Football - Players - Legends - Diego Maradona", 3),
        ("Sports - Football - Players - Legends - Johan Cruyff", 3),
        ("Sports - Football - Players - Legends - Franz Beckenbauer", 3),
        ("Sports - Football - Players - Current Stars - Career Records", 3),
        ("Sports - Football - Players - Current Stars - Lionel Messi", 6),
        ("Sports - Football - Players - Current Stars - Cristiano Ronaldo", 6),
        ("Sports - Football - Players - Current Stars - Kylian Mbappé", 3),
        ("Sports - Football - Players - Current Stars - Erling Haaland", 3),
        (
            "Sports - Football - Players - Combined Achievements - Ballon d'Or & World Cup",
            3,
        ),
        (
            "Sports - Football - Players - Combined Achievements - Champions League & Domestic League",
            3,
        ),
        ("Sports - Football - Awards - Ballon d'Or - Winners", 6),
        ("Sports - Football - Awards - Ballon d'Or - Records", 6),
        ("Sports - Tennis", 6),
        ("Sports - Tennis - Grand Slams - Winners", 7),
        ("Sports - Tennis - Grand Slams - Australian Open - Winners", 3),
        ("Sports - Tennis - Grand Slams - French Open (Roland Garros) - Winners", 3),
        ("Sports - Tennis - Grand Slams - Wimbledon - Winners", 3),
        ("Sports - Tennis - Grand Slams - US Open - Winners", 3),
        ("Sports - Tennis - Tours - ATP Tour - Rankings & Records", 3),
        ("Sports - Tennis - Tours - WTA Tour - Rankings & Records", 3),
        ("Sports - Tennis - Tournaments - ATP Finals - Winners", 3),
        ("Sports - Tennis - Tournaments - WTA Finals - Winners", 3),
        ("Sports - Tennis - Tournaments - Masters 1000 - Winners", 3),
        ("Sports - Tennis - Team Competitions - Davis Cup - Winners", 3),
        ("Sports - Tennis - Team Competitions - Billie Jean King Cup - Winners", 3),
        ("Sports - Tennis - Team Competitions - Laver Cup - Winners", 3),
        ("Sports - Tennis - Players - Career Records", 3),
        ("Sports - Tennis - Players - Male Legends - Grand Slam Wins", 3),
        ("Sports - Tennis - Players - Male Legends - Roger Federer", 3),
        ("Sports - Tennis - Players - Male Legends - Rafael Nadal", 3),
        ("Sports - Tennis - Players - Male Legends - Novak Djokovic", 3),
        ("Sports - Tennis - Players - Male Legends - Björn Borg", 3),
        ("Sports - Tennis - Players - Female Legends - Grand Slam Wins", 3),
        ("Sports - Tennis - Players - Female Legends - Serena Williams", 3),
        ("Sports - Tennis - Players - Female Legends - Steffi Graf", 3),
        ("Sports - Tennis - Players - Female Legends - Martina Navratilova", 3),
        ("Sports - Formula 1", 3),
        ("Sports - Formula 1 - Teams - Championship Wins", 3),
        ("Sports - Formula 1 - Teams - Scuderia Ferrari", 3),
        ("Sports - Formula 1 - Teams - Mercedes-AMG Petronas F1 Team", 3),
        ("Sports - Formula 1 - Teams - Red Bull Racing", 3),
        ("Sports - Formula 1 - Teams - McLaren F1 Team", 3),
        ("Sports - Formula 1 - Teams - Alpine F1 Team", 3),
        ("Sports - Formula 1 - Teams - Aston Martin F1 Team", 3),
        ("Sports - Formula 1 - Teams - Williams Racing", 3),
        ("Sports - Formula 1 - Drivers - Championship Wins", 3),
        ("Sports - Formula 1 - Drivers - Race Wins", 3),
        ("Sports - Formula 1 - Drivers - Lewis Hamilton", 3),
        ("Sports - Formula 1 - Drivers - Max Verstappen", 3),
        ("Sports - Formula 1 - Drivers - Charles Leclerc", 3),
        ("Sports - Formula 1 - Drivers - Lando Norris", 3),
        ("Sports - Formula 1 - Drivers - Legends - Championship Wins", 3),
        ("Sports - Formula 1 - Drivers - Legends - Ayrton Senna", 3),
        ("Sports - Formula 1 - Drivers - Legends - Michael Schumacher", 3),
        ("Sports - Formula 1 - Drivers - Legends - Alain Prost", 3),
        ("Sports - Formula 1 - Circuits - Race History", 3),
        ("Sports - Formula 1 - Circuits - Monaco Grand Prix", 3),
        ("Sports - Formula 1 - Circuits - Silverstone Circuit", 3),
        ("Sports - Formula 1 - Circuits - Monza Circuit", 3),
        ("Sports - Formula 1 - Circuits - Spa-Francorchamps", 3),
        ("Sports - Ice Hockey", 3),
        ("Sports - Ice Hockey - NHL - Stanley Cup Winners", 3),
        ("Sports - Ice Hockey - NHL - Records & Statistics", 3),
        ("Sports - Ice Hockey - NHL - Eastern Conference - Teams", 3),
        ("Sports - Ice Hockey - NHL - Eastern Conference - Boston Bruins", 3),
        ("Sports - Ice Hockey - NHL - Eastern Conference - Toronto Maple Leafs", 3),
        ("Sports - Ice Hockey - NHL - Eastern Conference - New York Rangers", 3),
        ("Sports - Ice Hockey - NHL - Western Conference - Teams", 3),
        ("Sports - Ice Hockey - NHL - Western Conference - Edmonton Oilers", 3),
        ("Sports - Ice Hockey - NHL - Western Conference - Colorado Avalanche", 3),
        (
            "Sports - Ice Hockey - European Leagues - KHL (Kontinental Hockey League) - Winners",
            3,
        ),
        (
            "Sports - Ice Hockey - European Leagues - SHL (Swedish Hockey League) - Winners",
            3,
        ),
        ("Sports - Ice Hockey - European Leagues - Liiga (Finland) - Winners", 3),
        ("Sports - Ice Hockey - European Leagues - DEL (Germany) - Winners", 3),
        ("Sports - Ice Hockey - International - IIHF World Championship - Winners", 3),
        ("Sports - Ice Hockey - International - Olympic Ice Hockey - Medalists", 3),
        ("Sports - Ice Hockey - Players - Career Statistics", 3),
        ("Sports - Ice Hockey - Players - Wayne Gretzky", 3),
        ("Sports - Ice Hockey - Players - Sidney Crosby", 3),
        ("Sports - Ice Hockey - Players - Connor McDavid", 3),
        ("Sports - UFC (Mixed Martial Arts)", 10),
        ("Sports - UFC - Champions - Heavyweight", 5),
        ("Sports - UFC - Champions - Light Heavyweight", 3),
        ("Sports - UFC - Champions - Middleweight", 3),
        ("Sports - UFC - Champions - Welterweight", 3),
        ("Sports - UFC - Champions - Lightweight", 3),
        ("Sports - UFC - Champions - Featherweight", 3),
        ("Sports - UFC - Champions - Bantamweight", 3),
        ("Sports - UFC - Women's Divisions - Champions", 3),
        ("Sports - UFC - Fighters - Fight Records", 3),
        ("Sports - UFC - Fighters - Jon Jones", 3),
        ("Sports - UFC - Fighters - Conor McGregor", 3),
        ("Sports - UFC - Fighters - Khabib Nurmagomedov", 3),
        ("Sports - UFC - Fighters - Islam Makhachev", 3),
        ("Sports - Basketball", 3),
        ("Sports - Basketball - NBA - Champions", 3),
        ("Sports - Basketball - NBA - Player Statistics", 3),
        ("Sports - Basketball - NBA - Team Statistics", 3),
        ("Sports - Basketball - NBA - Records & Achievements", 3),
        ("Sports - Basketball - NBA - Boston Celtics", 3),
        ("Sports - Basketball - NBA - Los Angeles Lakers", 3),
        ("Sports - Basketball - NBA - Golden State Warriors", 3),
        ("Sports - Basketball - NBA - Chicago Bulls", 3),
        ("Sports - Basketball - Players - Career Statistics", 3),
        ("Sports - Basketball - Players - Michael Jordan", 3),
        ("Sports - Basketball - Players - LeBron James", 3),
        ("Sports - Basketball - Players - Stephen Curry", 3),
        ("Sports - Basketball - Players - Nikola Jokic", 3),
        ("Sports - Basketball - Players - Victor Wembanyama", 3),
        ("Sports - Basketball - European Basketball - EuroLeague - Winners", 3),
        (
            "Sports - Basketball - European Basketball - EuroLeague - Real Madrid Baloncesto",
            3,
        ),
        (
            "Sports - Basketball - European Basketball - EuroLeague - FC Barcelona Bàsquet",
            3,
        ),
        (
            "Sports - Basketball - European Basketball - EuroLeague - Panathinaikos BC",
            3,
        ),
        (
            "Sports - Basketball - International - FIBA Basketball World Cup - Winners",
            3,
        ),
        ("Sports - Cycling", 3),
        ("Sports - Cycling - Grand Tours - Winners", 3),
        ("Sports - Cycling - Grand Tours - Tour de France - Winners", 3),
        ("Sports - Cycling - Grand Tours - Giro d'Italia - Winners", 3),
        ("Sports - Cycling - Grand Tours - Vuelta a España - Winners", 3),
        ("Sports - Cycling - Monuments - Winners", 3),
        ("Sports - Cycling - Monuments - Milan-San Remo - Winners", 3),
        ("Sports - Cycling - Monuments - Tour of Flanders - Winners", 3),
        ("Sports - Cycling - Monuments - Paris-Roubaix - Winners", 3),
        ("Sports - Cycling - Monuments - Liège-Bastogne-Liège - Winners", 3),
        ("Sports - Cycling - Monuments - Il Lombardia - Winners", 3),
        ("Sports - Rugby Union", 3),
        ("Sports - Rugby Union - International - Rugby World Cup - Winners", 3),
        (
            "Sports - Rugby Union - International - Six Nations Championship - Winners",
            3,
        ),
        ("Sports - Rugby Union - International - The Rugby Championship - Winners", 3),
        ("Sports - Rugby Union - Clubs - European Rugby Champions Cup - Winners", 3),
        ("Sports - Rugby Union - Clubs - English Premiership - Winners", 3),
        ("Sports - Rugby Union - Clubs - Top 14 (France) - Winners", 3),
        ("Sports - Golf", 3),
        ("Sports - Golf - Majors - Winners", 3),
        ("Sports - Golf - Majors - The Masters Tournament - Winners", 3),
        ("Sports - Golf - Majors - PGA Championship - Winners", 3),
        ("Sports - Golf - Majors - U.S. Open - Winners", 3),
        ("Sports - Golf - Majors - The Open Championship - Winners", 3),
        ("Sports - Golf - Team Competitions - Ryder Cup - Winners", 3),
        ("Sports - Athletics", 3),
        ("Sports - Athletics - World Athletics Championships - Medalists", 3),
        ("Sports - Athletics - Diamond League - Winners", 3),
        ("Sports - Athletics - Disciplines - World Records", 3),
        ("Sports - Athletics - Disciplines - Sprints - World Records", 3),
        (
            "Sports - Athletics - Disciplines - Middle and Long Distance - World Records",
            3,
        ),
        ("Sports - Athletics - Disciplines - Field Events - World Records", 3),
        ("Sports - Other Motorsports", 3),
        ("Sports - Other Motorsports - MotoGP - Champions", 3),
        ("Sports - Other Motorsports - World Rally Championship (WRC) - Champions", 3),
        ("Sports - Other Motorsports - 24 Hours of Le Mans - Winners", 3),
        ("Sports - Handball", 3),
        ("Sports - Handball - EHF Champions League - Winners", 3),
        ("Sports - Handball - World Men's Handball Championship - Winners", 3),
        ("Sports - Winter Sports", 3),
        ("Sports - Winter Sports - Alpine Skiing World Cup - Winners", 3),
        ("Sports - Winter Sports - Biathlon World Cup - Winners", 3),
        ("Sports - Winter Sports - Ski Jumping - Winners", 3),
        ("Sports - Olympic Games", 3),
        ("Sports - Olympic Games - Summer Olympics - Medal Counts", 3),
        ("Sports - Olympic Games - Summer Olympics - Host Cities", 3),
        ("Sports - Olympic Games - Summer Olympics - Athletics Records", 3),
        ("Sports - Olympic Games - Summer Olympics - Swimming Records", 3),
        ("Sports - Olympic Games - Winter Olympics - Medal Counts", 3),
        ("Sports - Olympic Games - Winter Olympics - Host Cities", 3),
        ("Sports - Olympic Games - Winter Olympics - Skiing Records", 3),
        ("Sports - Multi-Sport Events", 3),
        ("Sports - Multi-Sport Events - Commonwealth Games - Medal Counts", 3),
        ("Sports - Multi-Sport Events - Asian Games - Medal Counts", 3),
        ("Sports - Coaching/Management Records", 3),
        ("Sports - Football - Managers - Most Titles Won", 3),
        ("Sports - Basketball - Coaches - Championship Wins", 3),
        ("Sports - Venues & Infrastructure", 3),
        ("Sports - Famous Stadiums - Capacity & Location", 3),
        ("Sports - Famous Arenas - Key Events Hosted", 3),
        ("Sports - Doping & Controversies - Factual Cases", 3),
        ("Sports - Snooker", 6),
        ("Sports - Snooker - World Snooker Championship - Winners", 6),
        ("Sports - Snooker - Player Records (e.g., 147 breaks)", 3),
        ("E-Sports - General", 3),
        ("E-Sports by Game", 3),
        (
            "E-Sports - League of Legends (LoL) - World Championship (Worlds) - Winners",
            3,
        ),
        (
            "E-Sports - League of Legends (LoL) - LEC (League of Legends EMEA Championship) - Winners",
            3,
        ),
        ("E-Sports - Counter-Strike 2 (CS2) - Majors - Winners", 3),
        ("E-Sports - Dota 2 - The International - Winners", 3),
        ("E-Sports - Valorant - Champions Tour (VCT) - Winners", 3),
        ("E-Sports - Fortnite - Tournament Winners", 3),
        ("E-Sports - Call of Duty League (CDL) - Champions", 3),
        ("E-Sports - Rocket League Championship Series (RLCS) - Champions", 3),
        (
            "E-Sports - Fighting Games - Evolution Championship Series (EVO) - Winners",
            3,
        ),
        ("E-Sports - Teams - Tournament Wins", 3),
        ("E-Sports - Players & Personalities - Achievements", 3),
        ("Video Games - General", 3),
        ("Video Games by Genre", 3),
        ("Video Games - Action-Adventure - Grand Theft Auto (GTA) - Game Facts", 3),
        ("Video Games - First-Person Shooters (FPS) - Notable Titles", 3),
        ("Video Games - Strategy Games - Notable Titles", 3),
        ("Video Games - Strategy Games - Civilization Series - Game Facts", 3),
        ("Video Games - Sports Games - Notable Titles", 3),
        ("Video Games - Sports Games - EA Sports FC - Game Facts", 3),
        ("Video Games by Platform - Release Dates", 3),
        ("Video Games - PC Gaming - Historical Facts", 3),
        ("Video Games - Console Gaming - Historical Facts", 3),
        ("Video Games - Indie Games - Award Winners", 3),
        ("Video Games - Retro Gaming - Console Facts", 3),
        ("Traditional Games - General", 3),
        ("Board Games - Popular Titles & Rules", 3),
        ("Board Games - Strategy - Popular Titles & Rules", 3),
        ("Board Games - Party Games - Popular Titles & Rules", 3),
        ("Board Games - Specific Game Facts - Monopoly - Original Rules & Editions", 3),
        ("Board Games - Specific Game Facts - Chess - Grandmaster Titles & Records", 3),
        ("Card Games - Traditional - Rules & History", 3),
        ("Card Games - Collectible Card Games - Game Facts", 3),
        ("Tabletop Role-Playing Games (TTRPGs) - System Facts", 3),
        ("Tabletop RPGs - Dungeons & Dragons (D&D) - Edition Facts", 3),
        ("Gambling - General", 3),
        ("Sports Betting - Football Betting - Records & Outcomes", 3),
        ("Sports Betting - Horse Racing - Major Race Winners", 3),
        ("Sports Betting - Betting Terminology", 3),
        ("Casino Games - Rules & Odds", 3),
        ("Casino Games - Poker - Rules & Famous Hands", 3),
        ("Casino Games - Poker - Texas Hold'em - Rules & Variants", 3),
        ("Casino Games - Poker - World Series of Poker (WSOP) - Main Event Winners", 3),
        ("Casino Games - Blackjack - Rules & Strategy Basics", 3),
        ("Casino Games - Roulette - Payouts & Probabilities", 3),
        ("Gambling - Historical Gambling Events - Famous Wagers & Outcomes", 3),
    ]

    # difficulties = ["Easy", "Medium", "Hard"]
    difficulties = ["Medium", "Hard"]

    # Check for API key
    if not os.environ.get("GEMINI_API_KEY"):
        print("Please set the GEMINI_API_KEY environment variable")
        sys.exit(1)

    questions_per_batch = 3  # Questions per category/difficulty combination
    total_questions = 0

    print(
        f"Generating {questions_per_batch} questions for each category/difficulty combination..."
    )
    print(
        f"Total: {len(categories)} categories × {len(difficulties)} difficulties × {questions_per_batch} questions = {len(categories) * len(difficulties) * questions_per_batch} questions"
    )

    for category, count in categories:
        for difficulty in difficulties:
            print(
                f"\nGenerating {questions_per_batch} {difficulty} questions for {category}..."
            )

            try:
                # Generate questions
                questions_data = generate_questions(category, difficulty, count)

                if questions_data:
                    # Add to database
                    added_count = add_questions_to_database(questions_data)
                    total_questions += added_count
                    print(f"✓ Added {added_count} questions")
                else:
                    print(
                        f"✗ Failed to generate questions for {category} ({difficulty})"
                    )

                # Small delay to avoid rate limiting
                time.sleep(1)

            except Exception as e:
                print(f"✗ Error processing {category} ({difficulty}): {e}")
                continue

    print(f"\n🎉 Batch generation complete! Total questions added: {total_questions}")


if __name__ == "__main__":
    generate_batch()
