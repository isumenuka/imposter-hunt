
const fs = require('fs');
const path = require('path');

const RAW_DATA = {
  "Animals": [
    { word: "Lion", clueWords: ["King", "Mane", "Roar", "Pride", "Savanna", "Simba", "Jungle", "Golden", "Brave", "Hunter", "Predator", "Beast"] },
    { word: "Elephant", clueWords: ["Trunk", "Tusks", "Gray", "Memory", "Dumbo", "Africa", "Massive", "Herd", "Gentle", "Ivory", "Stampede", "Peanuts"] },
    { word: "Giraffe", clueWords: ["Neck", "Long", "Tall", "Spots", "Africa", "Savanna", "Leaves", "Tower", "Yellow", "Graceful", "Safari", "Giants"] },
    { word: "Penguin", clueWords: ["Tuxedo", "Ice", "Antarctica", "Waddle", "Slide", "Fish", "Flightless", "Cute", "Colony", "Black&White", "Cold", "Swimmer"] },
    { word: "Kangaroo", clueWords: ["Pouch", "Hop", "Australia", "Joey", "Marsupial", "Boxing", "Jump", "Outback", "Tail", "Bounce", "Down-Under", "Strong"] },
    { word: "Panda", clueWords: ["Bamboo", "Black&White", "China", "Cute", "Bear", "Endangered", "Fluffy", "Lazy", "Conservation", "Gentle", "Cuddly", "Monochrome"] },
    { word: "Snake", clueWords: ["Hiss", "Slither", "Scales", "Venom", "Reptile", "Coil", "Serpent", "Fangs", "Python", "Danger", "Shed", "Cold-Blooded"] },
    { word: "Eagle", clueWords: ["Bald", "Soar", "Freedom", "American", "Wings", "Predator", "Sky", "Sharp", "Talons", "Nest", "Majestic", "Hunter"] },
    { word: "Shark", clueWords: ["Jaws", "Teeth", "Ocean", "Fin", "Predator", "Swim", "Danger", "Great-White", "Attack", "Deep", "Hunter", "Reef"] },
    { word: "Dolphin", clueWords: ["Flipper", "Smart", "Ocean", "Jump", "Pod", "Friendly", "Playful", "Aquatic", "Click", "Echolocation", "Swimmer", "Mammal"] },
    { word: "Dog", clueWords: ["Bark", "Loyal", "Woof", "Pet", "Friend", "Puppy", "Tail", "Fetch", "Mans-Best", "Paw", "Furry", "Companion"] },
    { word: "Cat", clueWords: ["Meow", "Purr", "Whiskers", "Paws", "Nine-Lives", "Feline", "Pet", "Kitten", "Scratching", "Independent", "Furry", "Curious"] },
    { word: "Wolf", clueWords: ["Moon", "Howl", "Pack", "Wild", "Gray", "Forest", "Predator", "Alpha", "Fangs", "Night", "Hunter", "Lone"] },
    { word: "Bear", clueWords: ["Honey", "Hibernate", "Grizzly", "Cave", "Claw", "Furry", "Forest", "Teddy", "Strong", "Salmon", "Brown", "Dangerous"] },
    { word: "Zebra", clueWords: ["Stripes", "Black&White", "Africa", "Horse", "Herd", "Savanna", "Pattern", "Wild", "Grassland", "Fast", "Barcode", "Unique"] },
    { word: "Rabbit", clueWords: ["Carrot", "Hop", "Bunny", "Ears", "Fluffy", "Burrow", "Fast", "Easter", "Tail", "Cotton", "Cute", "Pet"] },
    { word: "Turtle", clueWords: ["Shell", "Slow", "Reptile", "Sea", "Tortoise", "Hard", "Ancient", "Steady", "Green", "Patient", "Swim", "Protected"] },
    { word: "Owl", clueWords: ["Hoot", "Wise", "Night", "Nocturnal", "Wings", "Bird", "Hunter", "Eyes", "Forest", "Silent", "Predator", "Moon"] },
    { word: "Monkey", clueWords: ["Banana", "Swing", "Tree", "Primate", "Tail", "Jungle", "Playful", "Curious", "Climb", "Troop", "Smart", "Agile"] },
    { word: "Horse", clueWords: ["Saddle", "Gallop", "Mane", "Stable", "Ride", "Neigh", "Fast", "Rider", "Ranch", "Wild", "Strong", "Majestic"] },
    { word: "Tiger", clueWords: ["Stripes", "Orange", "Jungle", "Fierce", "Predator", "Big-Cat", "Roar", "Hunter", "Endangered", "Bengal", "Wild", "Powerful"] },
    { word: "Cheetah", clueWords: ["Fast", "Spots", "Speed", "Run", "Africa", "Sprint", "Fastest", "Hunter", "Savanna", "Predator", "Sleek", "Agile"] },
    { word: "Gorilla", clueWords: ["Chest", "Strong", "Ape", "Jungle", "Silverback", "Mighty", "Primate", "King-Kong", "Forest", "Powerful", "Dominant", "Family"] },
    { word: "Fox", clueWords: ["Sly", "Clever", "Red", "Tail", "Cunning", "Forest", "Smart", "Quick", "Den", "Wild", "Bushy", "Sneaky"] },
    { word: "Whale", clueWords: ["Big", "Ocean", "Massive", "Blowhole", "Blue", "Mammal", "Song", "Deep", "Giant", "Swim", "Majestic", "Migration"] },
    { word: "Bat", clueWords: ["Vampire", "Cave", "Night", "Wings", "Sonar", "Fly", "Nocturnal", "Hang", "Dark", "Echo", "Mammal", "Dracula"] },
    { word: "Frog", clueWords: ["Prince", "Hop", "Ribbit", "Green", "Pond", "Amphibian", "Lily", "Jump", "Croak", "Tadpole", "Wet", "Slimy"] },
    { word: "Pig", clueWords: ["Mud", "Oink", "Pink", "Farm", "Snout", "Bacon", "Trough", "Messy", "Piglet", "Curly-Tail", "Roll", "Dirty"] },
    { word: "Cow", clueWords: ["Milk", "Moo", "Farm", "Spots", "Udder", "Beef", "Pasture", "Calf", "Grass", "Dairy", "Herd", "Bell"] },
    { word: "Sheep", clueWords: ["Wool", "Baa", "Flock", "Farm", "Fluffy", "White", "Lamb", "Pasture", "Shear", "Cloud", "Soft", "Meadow"] }
  ],
  "Foods": [
    { word: "Pizza", clueWords: ["Pepperoni", "Cheese", "Slice", "Italy", "Round", "Oven", "Delivery", "Crust", "Toppings", "Saucy", "Hot", "Delicious"] },
    { word: "Burger", clueWords: ["Bun", "Beef", "Patty", "Grill", "Cheese", "Fast-Food", "Pickle", "Sesame", "Bite", "Juicy", "Fries", "Ketchup"] },
    { word: "Sushi", clueWords: ["Roll", "Rice", "Fish", "Japan", "Raw", "Seaweed", "Chopsticks", "Wasabi", "Soy-Sauce", "Ginger", "Fresh", "Delicate"] },
    { word: "Pasta", clueWords: ["Italy", "Noodle", "Sauce", "Spaghetti", "Carbs", "Boil", "Marinara", "Cheese", "Fork", "Twist", "Al-Dente", "Meatballs"] },
    { word: "Chocolate", clueWords: ["Bar", "Sweet", "Cocoa", "Brown", "Candy", "Melt", "Dessert", "Sugar", "Treat", "Rich", "Dark", "Willy-Wonka"] },
    { word: "Ice Cream", clueWords: ["Cone", "Cold", "Scoop", "Vanilla", "Sweet", "Frozen", "Creamy", "Summer", "Melt", "Flavor", "Sundae", "Dessert"] },
    { word: "Taco", clueWords: ["Shell", "Mexico", "Beef", "Crunchy", "Salsa", "Lettuce", "Cheese", "Spicy", "Fold", "Tuesday", "Tortilla", "Fiesta"] },
    { word: "Salad", clueWords: ["Green", "Lettuce", "Healthy", "Bowl", "Vegetables", "Fresh", "Dressing", "Crunchy", "Diet", "Leaves", "Toss", "Caesar"] },
    { word: "Steak", clueWords: ["Rare", "Beef", "Grill", "Meat", "Juicy", "Medium", "Well-Done", "Seared", "Knife", "Protein", "Tender", "BBQ"] },
    { word: "Fries", clueWords: ["Ketchup", "Potato", "Crispy", "Salt", "Golden", "Fried", "Side", "Hot", "Fast-Food", "Crunch", "Strips", "Dip"] },
    { word: "Popcorn", clueWords: ["Movie", "Butter", "Pop", "Kernel", "Salty", "Theater", "Snack", "Crunchy", "Bag", "Microwave", "Cinema", "Corn"] },
    { word: "Donut", clueWords: ["Hole", "Sweet", "Ring", "Glaze", "Sprinkles", "Fried", "Dough", "Sugar", "Coffee", "Morning", "Round", "Bakery"] },
    { word: "Pancake", clueWords: ["Syrup", "Breakfast", "Fluffy", "Stack", "Round", "Maple", "Butter", "Griddle", "Batter", "Flip", "Morning", "Sweet"] },
    { word: "Waffle", clueWords: ["Iron", "Square", "Grid", "Breakfast", "Syrup", "Belgian", "Crispy", "Butter", "Holes", "Golden", "Pattern", "Sweet"] },
    { word: "Cookie", clueWords: ["Chip", "Sweet", "Chocolate", "Baked", "Jar", "Dough", "Crunchy", "Treat", "Round", "Snack", "Sugar", "Delicious"] },
    { word: "Apple", clueWords: ["Red", "Fruit", "Crunchy", "Tree", "Pie", "Doctor", "Core", "Juice", "Seeds", "Sweet", "Green", "Garden"] },
    { word: "Banana", clueWords: ["Yellow", "Peel", "Fruit", "Potassium", "Curved", "Monkey", "Bunch", "Smooth", "Sweet", "Tropical", "Soft", "Split"] },
    { word: "Grape", clueWords: ["Wine", "Purple", "Vine", "Bunch", "Fruit", "Juice", "Sweet", "Round", "Small", "Green", "Sour", "Cluster"] },
    { word: "Cheese", clueWords: ["Mouse", "Yellow", "Dairy", "Cheddar", "Slice", "Melt", "Sharp", "Milk", "Aged", "Block", "Holes", "Grate"] },
    { word: "Bread", clueWords: ["Toast", "Loaf", "Slice", "Wheat", "Butter", "Crust", "Bake", "Yeast", "Dough", "Fresh", "Sandwich", "Bakery"] },
    { word: "Rice", clueWords: ["Grain", "White", "Asia", "Bowl", "Sticky", "Steam", "Side", "Sushi", "Fried", "Field", "Carb", "Cooked"] },
    { word: "Soup", clueWords: ["Bowl", "Hot", "Liquid", "Spoon", "Broth", "Warm", "Chicken", "Noodle", "Comfort", "Steam", "Sip", "Salty"] },
    { word: "Sandwich", clueWords: ["Club", "Bread", "Layers", "Lunch", "Deli", "Meat", "Cheese", "BLT", "Sub", "Bite", "Toast", "Filling"] },
    { word: "Hot Dog", clueWords: ["Mustard", "Bun", "Sausage", "Ketchup", "Ball-Park", "Relish", "Stadium", "Grill", "Fast-Food", "Long", "American", "Frank"] },
    { word: "Cake", clueWords: ["Birthday", "Sweet", "Frosting", "Layers", "Candles", "Slice", "Dessert", "Celebration", "Bake", "Icing", "Party", "Chocolate"] },
    { word: "Pie", clueWords: ["Crust", "Apple", "Slice", "Dessert", "Bake", "Filling", "Sweet", "Round", "Lattice", "Cherry", "Pumpkin", "Oven"] },
    { word: "Bacon", clueWords: ["Breakfast", "Crispy", "Pork", "Strips", "Sizzle", "Salty", "Fried", "Eggs", "Morning", "Greasy", "Smoky", "Delicious"] },
    { word: "Egg", clueWords: ["Yolk", "White", "Shell", "Scrambled", "Fried", "Breakfast", "Chicken", "Protein", "Boiled", "Oval", "Sunny", "Omelette"] },
    { word: "Butter", clueWords: ["Toast", "Yellow", "Spread", "Dairy", "Melt", "Creamy", "Salted", "Stick", "Bread", "Rich", "Smooth", "Churn"] },
    { word: "Milk", clueWords: ["Cow", "White", "Dairy", "Drink", "Glass", "Cereal", "Bottle", "Fresh", "Calcium", "Pour", "Cold", "Creamy"] }
  ],
  "Brands": [
    { word: "Apple", clueWords: ["iPhone", "Mac", "Steve-Jobs", "Bite", "Tech", "Logo", "Innovation", "Sleek", "iOS", "Fruit", "Premium", "Silicon"] },
    { word: "Nike", clueWords: ["Just-Do-It", "Swoosh", "Sports", "Shoes", "Athletic", "Jordan", "Run", "Fitness", "Checkmark", "Brand", "Victory", "Performance"] },
    { word: "McDonald's", clueWords: ["Lovin-It", "Golden-Arches", "Burger", "Fast-Food", "Fries", "Ronald", "Happy-Meal", "Big-Mac", "Drive-Thru", "Clown", "Red", "Yellow"] },
    { word: "Coca-Cola", clueWords: ["Soda", "Red", "Fizz", "Can", "Cola", "Classic", "Pop", "Refreshing", "Bottle", "Drink", "Sweet", "Caffeine"] },
    { word: "Google", clueWords: ["Search", "Engine", "Internet", "Chrome", "Android", "Tech", "Alphabet", "Maps", "Gmail", "Colorful", "Query", "Information"] },
    { word: "Amazon", clueWords: ["Prime", "Shopping", "Delivery", "Online", "Box", "Bezos", "Smile", "River", "Fast", "Retail", "Arrow", "E-commerce"] },
    { word: "Tesla", clueWords: ["Electric", "Musk", "Car", "Battery", "Innovation", "Autopilot", "Tech", "Clean", "Future", "Model", "Energy", "Sustainable"] },
    { word: "Disney", clueWords: ["Magic", "Castle", "Mickey", "Movies", "Princess", "Theme-Park", "Animation", "Dreams", "Family", "Entertainment", "Fairy-Tale", "Childhood"] },
    { word: "Netflix", clueWords: ["Chill", "Streaming", "Binge", "Movies", "Series", "TV", "Red", "Watch", "Shows", "Subscription", "Entertainment", "Online"] },
    { word: "Samsung", clueWords: ["Android", "Galaxy", "Phone", "Tech", "Screen", "Electronics", "Korean", "Innovation", "TV", "Smart", "Mobile", "Display"] },
    { word: "Starbucks", clueWords: ["Coffee", "Green", "Mermaid", "Latte", "Cafe", "Cup", "Espresso", "Seattle", "Drink", "Frappuccino", "Barista", "Morning"] },
    { word: "Adidas", clueWords: ["Stripes", "Three", "Sports", "Shoes", "Athletic", "German", "Brand", "Run", "Sneakers", "Fitness", "Trefoil", "Performance"] },
    { word: "Microsoft", clueWords: ["Windows", "Office", "Gates", "Tech", "Software", "PC", "Computer", "Xbox", "Blue", "Operating", "Cloud", "Corporate"] },
    { word: "Sony", clueWords: ["PlayStation", "Gaming", "Console", "Electronics", "Japanese", "Tech", "TV", "Camera", "Music", "Entertainment", "Innovation", "Blue"] },
    { word: "Lego", clueWords: ["Block", "Build", "Brick", "Toy", "Denmark", "Colorful", "Plastic", "Construction", "Kids", "Creative", "Snap", "Set"] },
    { word: "IKEA", clueWords: ["Sweden", "Furniture", "Assembly", "Blue-Yellow", "Meatballs", "Flat-Pack", "Affordable", "Design", "Store", "Home", "Instructions", "Maze"] },
    { word: "Toyota", clueWords: ["Car", "Reliable", "Japanese", "Camry", "Corolla", "Vehicle", "Auto", "Quality", "Prius", "Hybrid", "Driving", "Trust"] },
    { word: "Gucci", clueWords: ["Luxury", "Fashion", "Italian", "Designer", "Expensive", "Logo", "Handbag", "Runway", "Style", "Premium", "Chic", "Elite"] },
    { word: "Rolex", clueWords: ["Watch", "Luxury", "Time", "Swiss", "Expensive", "Crown", "Prestige", "Quality", "Status", "Timepiece", "Gold", "Premium"] },
    { word: "Pepsi", clueWords: ["Blue", "Cola", "Soda", "Red-White", "Fizz", "Can", "Rival", "Pop", "Sweet", "Drink", "Refresh", "Caffeine"] },
    { word: "Facebook", clueWords: ["Blue", "Social", "Profile", "Friend", "Like", "Zuckerberg", "Meta", "Network", "Share", "Post", "Online", "Connect"] },
    { word: "Instagram", clueWords: ["Photo", "Filter", "Like", "Social", "Story", "Camera", "Selfie", "Post", "Share", "Influencer", "Feed", "Colorful"] },
    { word: "Twitter", clueWords: ["Bird", "Tweet", "Blue", "Social", "X", "Hashtag", "Timeline", "Post", "Trending", "Short", "Viral", "Characters"] },
    { word: "YouTube", clueWords: ["Video", "Watch", "Red", "Subscribe", "Channel", "Stream", "Content", "Creator", "Play", "Viral", "Tube", "Entertainment"] },
    { word: "Uber", clueWords: ["Taxi", "Ride", "Driver", "App", "Transport", "Black", "Car", "Pickup", "Share", "Tech", "Convenient", "Travel"] },
    { word: "Airbnb", clueWords: ["Stay", "Rental", "Travel", "Home", "Host", "Vacation", "Book", "App", "Accommodation", "Guest", "House", "Adventure"] },
    { word: "Spotify", clueWords: ["Music", "Stream", "Green", "Playlist", "Song", "Audio", "App", "Listen", "Premium", "Artist", "Sound", "Podcast"] },
    { word: "Ferrari", clueWords: ["Red", "Italian", "Luxury", "Horse", "Sports-Car", "Speed", "Racing", "Engine", "Expensive", "Supercar", "Elite", "Fast"] },
    { word: "Lamborghini", clueWords: ["Bull", "Yellow", "Italian", "Supercar", "Fast", "Luxury", "Expensive", "Speed", "Racing", "Doors", "Exotic", "Power"] },
    { word: "BMW", clueWords: ["German", "Car", "Luxury", "Blue-White", "Ultimate", "Driving", "Engine", "Premium", "Auto", "Quality", "Performance", "Bavarian"] }
  ],
  "Objects": [
    { word: "Phone", clueWords: ["Call", "Mobile", "Screen", "Ring", "Text", "App", "Dial", "Smart", "Speaker", "Touch", "Device", "Communication"] },
    { word: "Chair", clueWords: ["Sit", "Furniture", "Legs", "Back", "Seat", "Rest", "Wooden", "Comfort", "Table", "Office", "Cushion", "Support"] },
    { word: "Table", clueWords: ["Legs", "Furniture", "Flat", "Wood", "Dining", "Surface", "Top", "Desk", "Eat", "Stable", "Sit", "Home"] },
    { word: "Car", clueWords: ["Drive", "Vehicle", "Wheels", "Engine", "Road", "Auto", "Steering", "Gas", "Transport", "Sedan", "Fast", "Motor"] },
    { word: "Book", clueWords: ["Read", "Pages", "Story", "Cover", "Novel", "Library", "Words", "Chapter", "Author", "Paper", "Knowledge", "Literature"] },
    { word: "Pen", clueWords: ["Write", "Ink", "Click", "Paper", "Blue", "Ballpoint", "Sign", "Draw", "Office", "Tool", "Hand", "Scribble"] },
    { word: "Shoe", clueWords: ["Foot", "Lace", "Walk", "Sole", "Sneaker", "Wear", "Pair", "Heel", "Leather", "Comfort", "Boot", "Step"] },
    { word: "Watch", clueWords: ["Time", "Wrist", "Clock", "Strap", "Tick", "Hands", "Hour", "Second", "Digital", "Smart", "Band", "Timepiece"] },
    { word: "Glasses", clueWords: ["See", "Eyes", "Lens", "Frame", "Vision", "Clear", "Wear", "Read", "Prescription", "Spectacles", "Sight", "Focus"] },
    { word: "Key", clueWords: ["Lock", "Door", "Unlock", "Metal", "Keychain", "Open", "Turn", "Security", "Car", "House", "Ring", "Access"] },
    { word: "Door", clueWords: ["Knob", "Open", "Close", "Entry", "Frame", "Wood", "Handle", "Hinges", "Swing", "Exit", "Lock", "Entrance"] },
    { word: "Bed", clueWords: ["Sleep", "Mattress", "Pillow", "Sheets", "Rest", "Bedroom", "Comfortable", "Blanket", "Frame", "Dream", "Night", "Cozy"] },
    { word: "Lamp", clueWords: ["Light", "Bulb", "Bright", "Switch", "Shade", "Glow", "Table", "Electric", "Desk", "Illuminate", "Night", "Home"] },
    { word: "Scissors", clueWords: ["Cut", "Sharp", "Blades", "Snip", "Paper", "Metal", "Handles", "Tool", "Trim", "Open", "Craft", "Slice"] },
    { word: "Knife", clueWords: ["Sharp", "Blade", "Cut", "Kitchen", "Edge", "Metal", "Handle", "Slice", "Chef", "Tool", "Dangerous", "Chop"] },
    { word: "Cup", clueWords: ["Drink", "Mug", "Handle", "Sip", "Coffee", "Tea", "Ceramic", "Hold", "Liquid", "Container", "Pour", "Hot"] },
    { word: "Mirror", clueWords: ["Reflect", "Glass", "Image", "Look", "Face", "Reflection", "Shine", "Wall", "Vanity", "See", "Self", "Surface"] },
    { word: "Umbrella", clueWords: ["Rain", "Open", "Wet", "Cover", "Handle", "Fold", "Protect", "Canopy", "Storm", "Dry", "Weather", "Shade"] },
    { word: "Bag", clueWords: ["Carry", "Hold", "Strap", "Tote", "Shopping", "Purse", "Backpack", "Container", "Handles", "Pack", "Store", "Portable"] },
    { word: "Hat", clueWords: ["Head", "Wear", "Cap", "Brim", "Cover", "Fashion", "Shade", "Top", "Baseball", "Protection", "Cool", "Style"] },
    { word: "Computer", clueWords: ["Type", "Screen", "Keyboard", "Mouse", "Desktop", "Laptop", "Tech", "Work", "Internet", "Monitor", "Digital", "Device"] },
    { word: "Mouse", clueWords: ["Click", "Computer", "Scroll", "Pointer", "Cursor", "Pad", "Wireless", "Button", "Tech", "Device", "Hand", "Navigate"] },
    { word: "Keyboard", clueWords: ["QWERTY", "Type", "Keys", "Computer", "Letters", "Space", "Enter", "Mechanical", "Wireless", "Press", "Input", "Tech"] },
    { word: "Bottle", clueWords: ["Water", "Drink", "Plastic", "Glass", "Cap", "Container", "Pour", "Liquid", "Hydrate", "Reusable", "Fill", "Beverage"] },
    { word: "Plate", clueWords: ["Food", "Dish", "Round", "Ceramic", "Eat", "Dinner", "Table", "Serve", "Clean", "Kitchen", "White", "Flat"] },
    { word: "Fork", clueWords: ["Prongs", "Eat", "Utensil", "Metal", "Spear", "Stab", "Dinner", "Silverware", "Tine", "Table", "Kitchen", "Food"] },
    { word: "Spoon", clueWords: ["Soup", "Scoop", "Eat", "Utensil", "Metal", "Bowl", "Stir", "Silverware", "Round", "Cereal", "Kitchen", "Food"] },
    { word: "Television", clueWords: ["Screen", "Watch", "Remote", "Channel", "Show", "Display", "Entertainment", "Living-Room", "HD", "Broadcast", "News", "Programs"] },
    { word: "Remote", clueWords: ["Control", "Buttons", "TV", "Click", "Channel", "Volume", "Infrared", "Wireless", "Batteries", "Device", "Point", "Change"] },
    { word: "Pillow", clueWords: ["Soft", "Sleep", "Head", "Bed", "Cushion", "Rest", "Comfort", "Fluffy", "White", "Feather", "Dream", "Cozy"] }
  ],
  "Anime": [
    { word: "Naruto", clueWords: ["Ninja", "Hokage", "Ramen", "Orange", "Uzumaki", "Leaf", "Shadow-Clone", "Nine-Tails", "Shinobi", "Hidden-Village", "Rasengan", "Jutsu"] },
    { word: "One Piece", clueWords: ["Pirate", "Luffy", "Straw-Hat", "Treasure", "Devil-Fruit", "Grand-Line", "Rubber", "Ship", "Crew", "Adventure", "Sea", "Manga"] },
    { word: "Dragon Ball", clueWords: ["Goku", "Saiyan", "Kamehameha", "Power", "Orange", "Super", "Z", "Fighter", "Energy", "Martial-Arts", "Transformation", "Wishes"] },
    { word: "Attack on Titan", clueWords: ["Wall", "Titan", "Scout", "Eren", "Colossal", "Sword", "Gear", "Giant", "Wall-Maria", "Survey-Corps", "Humanity", "Fear"] },
    { word: "Pokemon", clueWords: ["Pikachu", "Catch", "Trainer", "Battle", "Evolution", "Pokeball", "Ash", "Gym", "Electric", "Gotta-Catch", "Card", "Yellow"] },
    { word: "Demon Slayer", clueWords: ["Sword", "Tanjiro", "Breathing", "Demon", "Nezuko", "Hashira", "Blade", "Water", "Fight", "Katana", "Corps", "Muzan"] },
    { word: "Death Note", clueWords: ["Apple", "Light", "Notebook", "Ryuk", "Shinigami", "L", "Write", "Death", "Justice", "Kira", "Mind-Game", "Rules"] },
    { word: "Sailor Moon", clueWords: ["Transformation", "Moon", "Magical-Girl", "Usagi", "Sailor", "Tiara", "Power", "Princess", "Love", "Guardian", "Crystal", "Justice"] },
    { word: "My Hero Academia", clueWords: ["Quirk", "Hero", "Plus-Ultra", "Deku", "Power", "Villain", "Academy", "Midoriya", "All-Might", "School", "Super", "Green"] },
    { word: "Fullmetal Alchemist", clueWords: ["Transmutation", "Alchemy", "Edward", "Metal-Arm", "Brothers", "Circle", "Truth", "Equivalent", "Philosopher", "Stone", "Science", "Magic"] },
    { word: "Spirited Away", clueWords: ["Bathhouse", "Chihiro", "Spirit", "No-Face", "Ghibli", "Dragon", "Work", "Magic", "Name", "Parents", "Haku", "River"] },
    { word: "Totoro", clueWords: ["Forest", "Ghibli", "Fluffy", "Spirit", "Neighbor", "Umbrella", "Cat-Bus", "Giant", "Tree", "Girls", "Gray", "Magical"] },
    { word: "Evangelion", clueWords: ["Eva", "Mecha", "Shinji", "Robot", "NERV", "Angel", "Pilot", "Purple", "Unit", "Apocalypse", "Mind", "Giant"] },
    { word: "One Punch Man", clueWords: ["Bald", "Saitama", "Hero", "Punch", "Caped", "Strong", "One-Hit", "Genos", "Yellow", "Boring", "Overpowered", "Training"] },
    { word: "Bleach", clueWords: ["Soul-Reaper", "Ichigo", "Sword", "Hollow", "Zanpakuto", "Orange", "Shinigami", "Bankai", "Spirit", "Soul-Society", "Death", "Getsuga"] },
    { word: "Hunter x Hunter", clueWords: ["Hunter", "Gon", "Nen", "License", "Killua", "Exam", "Power", "Friend", "Adventure", "Chimera", "Ant", "Hisoka"] },
    { word: "Jojo", clueWords: ["Stand", "Bizarre", "Joestar", "Ora", "Power", "Adventure", "Dio", "Pose", "Spirit", "Fighting", "Meme", "Colorful"] },
    { word: "Cowboy Bebop", clueWords: ["Space", "Cowboy", "Bounty", "Spike", "Jazz", "Ship", "Bebop", "Future", "Hunter", "Cool", "Cigarette", "Music"] },
    { word: "Akira", clueWords: ["Bike", "Motorcycle", "Red", "Tokyo", "Psychic", "Cyberpunk", "Tetsuo", "Kaneda", "Explosion", "Power", "Future", "City"] },
    { word: "Yu-Gi-Oh", clueWords: ["Card", "Duel", "Yugi", "Monster", "Deck", "Blue-Eyes", "Dark-Magician", "Trap", "Battle", "Game", "Pharaoh", "Millennium"] },
    { word: "Ghibli", clueWords: ["Studio", "Miyazaki", "Animation", "Spirited", "Totoro", "Magic", "Fantasy", "Film", "Japan", "Beautiful", "Nature", "Dream"] },
    { word: "Chainsaw Man", clueWords: ["Devil", "Chainsaw", "Denji", "Power", "Blood", "Contract", "Heart", "Pochita", "Hunter", "Gore", "Dark", "Violence"] },
    { word: "Jujutsu Kaisen", clueWords: ["Curse", "Yuji", "Sorcerer", "Gojo", "Domain", "Sukuna", "Power", "Blindfold", "School", "Magic", "Fight", "Spirit"] },
    { word: "Spy x Family", clueWords: ["Anya", "Spy", "Family", "Mind-Read", "Pink", "Mission", "Assassin", "Twilight", "Secret", "Loid", "Cute", "Forger"] },
    { word: "Haikyuu", clueWords: ["Volleyball", "Spike", "Court", "Jump", "Hinata", "Kageyama", "Team", "Serve", "Net", "Orange", "Karasuno", "Crow"] },
    { word: "Tokyo Ghoul", clueWords: ["Mask", "Kaneki", "Half", "Ghoul", "White-Hair", "Kagune", "Coffee", "Eyepatch", "Centipede", "Human", "Monster", "Cafe"] },
    { word: "Code Geass", clueWords: ["Eye", "Geass", "Lelouch", "Zero", "Mask", "Mecha", "Power", "Purple", "Command", "Rebellion", "Chess", "Emperor"] },
    { word: "Fairy Tail", clueWords: ["Guild", "Magic", "Natsu", "Dragon", "Fire", "Lucy", "Happy", "Wizard", "Mark", "Friend", "Power", "Adventure"] },
    { word: "Sword Art Online", clueWords: ["VR", "Kirito", "Sword", "Online", "Game", "Virtual", "Asuna", "Black", "MMORPG", "Headset", "Level", "Fantasy"] },
    { word: "Gintama", clueWords: ["Samurai", "Gintoki", "Silver", "Comedy", "Sword", "Funny", "Japan", "Sugar", "Odd-Jobs", "Madao", "Parody", "Alien"] }
  ],
  "Video Games": [
    { word: "Minecraft", clueWords: ["Block", "Craft", "Creeper", "Build", "Steve", "Mine", "Cube", "Diamond", "Survival", "Pickaxe", "Redstone", "World"] },
    { word: "Fortnite", clueWords: ["Build", "Battle-Royale", "Victory", "Emote", "Dance", "Island", "Drop", "Storm", "100", "Llama", "V-Bucks", "Shooter"] },
    { word: "Mario", clueWords: ["Jump", "Plumber", "Red", "Mustache", "Luigi", "Princess", "Italian", "Coin", "Mushroom", "Pipe", "Star", "Nintendo"] },
    { word: "Pokemon", clueWords: ["Catch", "Trainer", "Pikachu", "Battle", "Pokeball", "Evolution", "Game-Boy", "Red-Blue", "Gym", "Champion", "Type", "Team"] },
    { word: "Call of Duty", clueWords: ["War", "Shooter", "FPS", "Military", "Gun", "Warzone", "Campaign", "Multiplayer", "Kill", "Modern", "Combat", "Squad"] },
    { word: "GTA", clueWords: ["Car", "Crime", "Theft", "Auto", "City", "Wanted", "Mission", "Gang", "Vice", "San-Andreas", "Rockstar", "Open-World"] },
    { word: "Zelda", clueWords: ["Hyrule", "Link", "Legend", "Sword", "Triforce", "Princess", "Ganon", "Green", "Shield", "Ocarina", "Adventure", "Dungeon"] },
    { word: "Sonic", clueWords: ["Ring", "Fast", "Blue", "Hedgehog", "Speed", "Tails", "Green-Hill", "Spin", "Eggman", "Sega", "Dash", "Emerald"] },
    { word: "Tetris", clueWords: ["Line", "Block", "Fall", "Clear", "Puzzle", "Stack", "Shape", "Russian", "Game-Boy", "Rotate", "Complete", "Rows"] },
    { word: "Pac-Man", clueWords: ["Ghost", "Dot", "Maze", "Yellow", "Arcade", "Chomp", "Blinky", "Cherry", "Power-Pellet", "Wakka", "Classic", "Circle"] },
    { word: "Among Us", clueWords: ["Sus", "Imposter", "Crew", "Space", "Vote", "Task", "Emergency", "Vent", "Sabotage", "Red", "Meeting", "Lie"] },
    { word: "Roblox", clueWords: ["Blox", "Avatar", "Cube", "Game", "Create", "Platform", "Kids", "Robux", "Build", "Play", "Community", "Virtual"] },
    { word: "League of Legends", clueWords: ["Rift", "MOBA", "Champion", "Lane", "Mid", "Nexus", "Tower", "Summoner", "Baron", "Dragon", "Team", "Minion"] },
    { word: "Overwatch", clueWords: ["Hero", "Shooter", "Team", "Objective", "Ultimate", "Tracer", "Mercy", "Tank", "DPS", "Support", "Payload", "Blizzard"] },
    { word: "FIFA", clueWords: ["Goal", "Soccer", "Football", "Kick", "Ball", "Field", "EA", "Ultimate-Team", "Match", "Score", "Stadium", "Card"] },
    { word: "Sims", clueWords: ["Life", "Simulate", "Family", "Build", "House", "Career", "Relationship", "Plumbob", "Green", "Diamond", "EA", "Virtual"] },
    { word: "Final Fantasy", clueWords: ["Crystal", "RPG", "Cloud", "Sword", "Magic", "Summon", "Chocobo", "Party", "Quest", "Turn-Based", "Japanese", "Fantasy"] },
    { word: "Halo", clueWords: ["Spartan", "Master-Chief", "Ring", "Helmet", "Covenant", "Green", "FPS", "Cortana", "Sci-Fi", "Armor", "343", "Bungie"] },
    { word: "Witcher", clueWords: ["Monster", "Geralt", "Sword", "White-Hair", "Hunt", "Ciri", "Medallion", "Potion", "Magic", "Medieval", "Contract", "Gwent"] },
    { word: "Skyrim", clueWords: ["Dragon", "Nord", "Shout", "Arrow-Knee", "Scroll", "FUS-RO-DAH", "Dovahkiin", "RPG", "Quest", "Dungeon", "Mage", "Warriors"] },
    { word: "Elden Ring", clueWords: ["Ring", "Souls", "Tarnished", "Grace", "Open-World", "Difficult", "Boss", "FromSoftware", "George-RR", "Death", "Lands-Between", "Magic"] },
    { word: "Dark Souls", clueWords: ["Bonfire", "Die", "Difficult", "Boss", "Undead", "Praise-Sun", "Estus", "Souls", "FromSoftware", "Hollow", "Fire", "Challenge"] },
    { word: "God of War", clueWords: ["Boy", "Kratos", "Axe", "Greek", "Norse", "Rage", "Atreus", "God", "Chains", "Blades", "Sparta", "Revenge"] },
    { word: "Spider-Man", clueWords: ["Web", "Swing", "New-York", "Parker", "Red", "Suit", "Hero", "Crime", "Wall", "Mask", "Spider", "Marvel"] },
    { word: "Last of Us", clueWords: ["Zombie", "Joel", "Ellie", "Apocalypse", "Survive", "Clicker", "Infected", "Naughty-Dog", "Cure", "Post", "Fungus", "Cordyceps"] },
    { word: "Red Dead Redemption", clueWords: ["Cowboy", "Arthur", "Wild-West", "Horse", "Outlaw", "Gang", "Dutch", "Redemption", "Gun", "Camp", "Rockstar", "Frontier"] },
    { word: "Cyberpunk", clueWords: ["City", "Night", "Future", "Neon", "2077", "V", "Keanu", "Implant", "Corpo", "Samurai", "Tech", "Dystopia"] },
    { word: "Valorant", clueWords: ["Spike", "Tactical", "Shooter", "Agent", "Ability", "Riot", "Plant", "Defuse", "5v5", "Round", "Headshot", "Competitive"] },
    { word: "Apex Legends", clueWords: ["Squad", "Battle-Royale", "Legend", "Ping", "Ability", "Respawn", "EA", "Drop", "Ring", "Champion", "Team", "Ultimate"] },
    { word: "Destiny", clueWords: ["Light", "Guardian", "Traveler", "Bungie", "Raid", "Loot", "Ghost", "Shooter", "Space", "Power", "Exotic", "Fireteam"] }
  ],
  "TV Shows": [
    { word: "Friends", clueWords: ["Cafe", "Coffee", "Central-Perk", "Ross", "Monica", "Chandler", "Rachel", "Joey", "Phoebe", "Couch", "Sitcom", "NYC"] },
    { word: "Game of Thrones", clueWords: ["Throne", "King", "Dragon", "Winter", "Stark", "HBO", "Westeros", "Jon-Snow", "Medieval", "War", "Daenerys", "Sword"] },
    { word: "Stranger Things", clueWords: ["Eleven", "Upside-Down", "Demogorgon", "Netflix", "Hawkins", "80s", "Kids", "Mind-Flayer", "Psychic", "Bike", "Horror", "Monster"] },
    { word: "Breaking Bad", clueWords: ["Cook", "Meth", "Walter", "Jesse", "Heisenberg", "RV", "Blue", "Chemistry", "Drug", "AMC", "Say-My-Name", "Cancer"] },
    { word: "The Office", clueWords: ["Boss", "Michael", "Dwight", "Paper", "Dunder", "Sitcom", "Desk", "Pam", "Jim", "Mockumentary", "Scranton", "Conference"] },
    { word: "Squid Game", clueWords: ["Doll", "Red-Light", "456", "Korean", "Debt", "Netflix", "Game", "Elimination", "Money", "Guard", "Triangle", "Mask"] },
    { word: "The Simpsons", clueWords: ["Yellow", "Homer", "Bart", "Springfield", "Donut", "Cartoon", "Marge", "Lisa", "FOX", "Couch-Gag", "Nuclear", "D'oh"] },
    { word: "Spongebob", clueWords: ["Square", "Pants", "Pineapple", "Patrick", "Bikini-Bottom", "Krusty-Krab", "Squidward", "Yellow", "Cartoon", "Ocean", "Absorbent", "Gary"] },
    { word: "Rick and Morty", clueWords: ["Science", "Portal", "Wubba-Lubba", "Dimension", "Scientist", "Grandson", "Pickle", "Sci-Fi", "Adult-Swim", "Burp", "Crazy", "Multiverse"] },
    { word: "Walking Dead", clueWords: ["Walker", "Zombie", "Rick", "Apocalypse", "AMC", "Survive", "Daryl", "Dead", "Crossbow", "Infection", "Atlanta", "Group"] },
    { word: "Mandalorian", clueWords: ["Helmet", "Grogu", "Baby-Yoda", "Bounty", "Star-Wars", "Armor", "Din", "Disney", "Way", "Beskar", "Hunter", "Galactic"] },
    { word: "The Boys", clueWords: ["Hero", "Homelander", "Super", "Corrupt", "Amazon", "Power", "Violent", "Butcher", "Vought", "Cape", "Dark", "Seven"] },
    { word: "Sherlock", clueWords: ["Detective", "Holmes", "Watson", "221B", "London", "Deduction", "Pipe", "Mystery", "Solve", "Coat", "BBC", "Genius"] },
    { word: "Black Mirror", clueWords: ["Future", "Tech", "Dystopia", "Anthology", "Netflix", "Dark", "Technology", "Episode", "Disturbing", "Society", "Twist", "Digital"] },
    { word: "The Crown", clueWords: ["Royal", "Queen", "Elizabeth", "British", "Monarchy", "Palace", "Netflix", "UK", "History", "Throne", "Philip", "Drama"] },
    { word: "Money Heist", clueWords: ["Bank", "Heist", "Professor", "Bella-Ciao", "Mask", "Red", "Spanish", "Dali", "Robbery", "Plan", "Team", "Gold"] },
    { word: "The Witcher", clueWords: ["Sword", "Geralt", "Monster", "Toss-Coin", "Netflix", "White-Hair", "Magic", "Ciri", "Medallion", "Witcher", "Hunt", "Fantasy"] },
    { word: "House of the Dragon", clueWords: ["Targaryen", "Dragon", "Prequel", "Throne", "HBO", "Fire", "Silver", "Family", "War", "Westeros", "King", "Power"] },
    { word: "Better Call Saul", clueWords: ["Lawyer", "Saul", "Jimmy", "Breaking-Bad", "Prequel", "AMC", "Attorney", "Slippin", "Kim", "Law", "Scam", "Mike"] },
    { word: "Family Guy", clueWords: ["Dog", "Griffin", "Peter", "Brian", "Stewie", "Meg", "Lois", "Cartoon", "FOX", "Chicken", "Rhode-Island", "Cutaway"] },
    { word: "South Park", clueWords: ["Colorado", "Cartman", "Kenny", "Stan", "Kyle", "Cartoon", "Satirical", "Mountain", "Comedy", "Construction-Paper", "Controversial", "Town"] },
    { word: "Futurama", clueWords: ["Delivery", "Future", "Fry", "Robot", "Bender", "3000", "Planet-Express", "Sci-Fi", "Leela", "Cartoon", "Comedy", "Space"] },
    { word: "Seinfeld", clueWords: ["Nothing", "Jerry", "Elaine", "George", "Kramer", "NYC", "Sitcom", "Comedian", "Observational", "90s", "Soup", "Show-About"] },
    { word: "Brooklyn 99", clueWords: ["Police", "Jake", "Detective", "Precinct", "Captain", "Amy", "Terry", "Boyle", "Rosa", "Sitcom", "Holt", "Comedy"] },
    { word: "Parks and Rec", clueWords: ["Government", "Leslie", "Parks", "Pawnee", "Ron", "Sitcom", "Andy", "April", "Tom", "Recreation", "Indiana", "Waffle"] },
    { word: "Ted Lasso", clueWords: ["Coach", "Football", "Soccer", "Positive", "Apple", "Mustache", "Believe", "American", "UK", "Team", "Inspirational", "AFC"] },
    { word: "Succession", clueWords: ["CEO", "Roy", "Logan", "Business", "HBO", "Wealth", "Family", "Power", "Media", "Drama", "Kendall", "Billion"] },
    { word: "Euphoria", clueWords: ["Teen", "Rue", "HBO", "Drugs", "High-School", "Zendaya", "Neon", "Drama", "Makeup", "Gen-Z", "Dark", "Jules"] },
    { word: "Wednesday", clueWords: ["Addams", "Gothic", "School", "Jenna", "Netflix", "Nevermore", "Thing", "Dark", "Pigtails", "Mystery", "Monster", "Family"] },
    { word: "Last of Us", clueWords: ["Cordyceps", "Fungus", "Joel", "Ellie", "HBO", "Apocalypse", "Zombie", "Video-Game", "Survive", "Infection", "Cure", "Clicker"] }
  ],
  "Celebrities": [
    { word: "Taylor Swift", clueWords: ["Song", "Singer", "Pop", "Eras", "13", "Country", "Blonde", "Swiftie", "Album", "Tour", "Red", "Love-Story"] },
    { word: "Elon Musk", clueWords: ["Mars", "Tesla", "SpaceX", "Rockets", "Twitter", "X", "Billionaire", "Tech", "Electric", "CEO", "Entrepreneur", "Flamethrower"] },
    { word: "Michael Jackson", clueWords: ["Dance", "Moonwalk", "Thriller", "King-Pop", "Glove", "Smooth-Criminal", "Beat-It", "White-Glove", "Jacksons", "Music", "Legend", "Billie-Jean"] },
    { word: "Beyonce", clueWords: ["Single-Ladies", "Queen-B", "Singer", "Destiny", "Jay-Z", "Renaissance", "Formation", "Halo", "Diva", "Lemonade", "Power", "Album"] },
    { word: "Messi", clueWords: ["Goal", "Soccer", "Argentina", "Barcelona", "GOAT", "Football", "Left-Foot", "Dribble", "Inter-Miami", "World-Cup", "10", "Genius"] },
    { word: "Ronaldo", clueWords: ["Seven", "CR7", "Portugal", "Soccer", "Goal", "Real-Madrid", "Juventus", "Manchester", "SIUU", "Athlete", "Football", "Jump"] },
    { word: "Donald Trump", clueWords: ["Tower", "President", "Reality", "Apprentice", "Red-Tie", "Real-Estate", "MAGA", "Businessman", "New-York", "Hair", "Golf", "Billionaire"] },
    { word: "Dwayne Johnson", clueWords: ["Rock", "Wrestler", "WWE", "Muscles", "Eyebrow", "Fast-Furious", "Moana", "Bald", "Jungle", "Jumanji", "Strong", "Charisma"] },
    { word: "Tom Cruise", clueWords: ["Mission", "Impossible", "Top-Gun", "Maverick", "Actor", "Scientology", "Stunts", "Run", "Couch", "Hollywood", "Action", "Risky-Business"] },
    { word: "Brad Pitt", clueWords: ["Hollywood", "Actor", "Fight-Club", "Angelina", "Blonde", "Once-Upon", "Troy", "Handsome", "Ocean", "Plan-B", "Movie-Star", "Seven"] },
    { word: "Marilyn Monroe", clueWords: ["Blonde", "Icon", "Actress", "Seven-Year", "Dress", "Beauty", "50s", "Hollywood", "Gentlemen", "Some-Like-Hot", "Diamonds", "Glamour"] },
    { word: "Albert Einstein", clueWords: ["Physics", "E=mc2", "Genius", "Scientist", "Relativity", "Nobel", "Tongue", "Hair", "Theory", "Math", "Smart", "Formula"] },
    { word: "Kim Kardashian", clueWords: ["Famous", "Reality", "Kanye", "Family", "Skims", "Selfie", "Influencer", "KUWTK", "Business", "Social-Media", "Beauty", "Curves"] },
    { word: "Justin Bieber", clueWords: ["Pop", "Baby", "Singer", "Canadian", "Belieber", "Sorry", "Hailey", "Young", "YouTube", "Love-Yourself", "Tattoo", "Purpose"] },
    { word: "Will Smith", clueWords: ["Prince", "Bel-Air", "Slap", "Actor", "Fresh", "Oscar", "Men-In-Black", "Rapper", "Jada", "Independence", "Pursuit", "Gemini"] },
    { word: "Oprah", clueWords: ["Show", "Talk", "Book-Club", "Billionaire", "Media", "You-Get", "Chicago", "Philanthropy", "Magazine", "Influential", "Weight-Watchers", "Harpo"] },
    { word: "Ariana Grande", clueWords: ["High-Note", "Singer", "Ponytail", "Thank-U-Next", "Pop", "Dangerous", "7-Rings", "Broadway", "Nickelodeon", "Voice", "Whistle", "Position"] },
    { word: "Billie Eilish", clueWords: ["Hair", "Green", "Whisper", "Bad-Guy", "Young", "Ocean-Eyes", "Grammy", "Alternative", "Brother", "Finneas", "Indie", "Baggy"] },
    { word: "Drake", clueWords: ["Rapper", "Hotline", "Degrassi", "Canadian", "Toronto", "OVO", "6God", "Views", "Started-Bottom", "Scorpion", "Hip-Hop", "Certified"] },
    { word: "Eminem", clueWords: ["Rap-God", "Slim-Shady", "Detroit", "8-Mile", "Marshall", "White", "Fast", "Lose-Yourself", "Real-Slim", "Stan", "Mom-Spaghetti", "Without-Me"] },
    { word: "Kanye West", clueWords: ["Yeezy", "Kim", "Rapper", "Producer", "Chicago", "Graduation", "Runaway", "Sunday-Service", "Fashion", "808s", "College-Dropout", "Genius"] },
    { word: "Rihanna", clueWords: ["Umbrella", "Singer", "Fenty", "Barbados", "Diamonds", "Work", "Beauty", "Pop", "Lingerie", "Navy", "We-Found-Love", "Billionaire"] },
    { word: "Lady Gaga", clueWords: ["Poker", "Face", "Meat-Dress", "Born-This-Way", "Pop", "Eccentric", "Fame", "Monster", "Star-Born", "演員", "Shallow", "Avant-Garde"] },
    { word: "Kylie Jenner", clueWords: ["Lips", "Cosmetics", "Kardashian", "Reality", "Billionaire", "Stormi", "Makeup", "Influencer", "Young", "KUWTK", "Business", "Travis"] },
    { word: "Selena Gomez", clueWords: ["Wizard", "Disney", "Singer", "Rare", "Justin", "Actress", "Lose-You", "Heart-Wants", "13-Reasons", "Only-Murders", "Kidney", "Pop"] },
    { word: "Harry Styles", clueWords: ["Direction", "One", "Watermelon", "British", "Singer", "Fashion", "As-It-Was", "Fine-Line", "Dunkirk", "Boa", "Gucci", "Heartthrob"] },
    { word: "Zendaya", clueWords: ["Dune", "Euphoria", "Spider-Man", "Disney", "Fashion", "MJ", "Actress", "KC-Undercover", "Tom", "Emmy", "Model", "Icon"] },
    { word: "Tom Holland", clueWords: ["Spider", "Man", "British", "Marvel", "Zendaya", "Lip-Sync", "Umbrella", "Actor", "Uncharted", "Young", "Flip", "MCU"] },
    { word: "Johnny Depp", clueWords: ["Pirate", "Jack-Sparrow", "Caribbean", "Scissorhands", "Trial", "Wonka", "Eccentric", "Amber", "Grindelwald", "Hollywood", "Alice", "Captain"] },
    { word: "Leonardo DiCaprio", clueWords: ["Oscar", "Actor", "Titanic", "Leo", "Inception", "Django", "Gatsby", "Revenant", "Wolf-Wall-Street", "Environment", "Model", "Young"] }
  ],
  "Locations": [
    { word: "Paris", clueWords: ["France", "Eiffel", "Tower", "City-Love", "Baguette", "Louvre", "Romance", "Wine", "Fashion", "Notre-Dame", "Versailles", "Europe"] },
    { word: "New York", clueWords: ["City", "NYC", "Manhattan", "Statue-Liberty", "Big-Apple", "Times-Square", "Broadway", "Skyscraper", "Wall-Street", "Central-Park", "Taxi", "USA"] },
    { word: "London", clueWords: ["Bridge", "Big-Ben", "UK", "Tea", "Queen", "Thames", "Tower", "Red-Bus", "Buckingham", "England", "British", "Parliament"] },
    { word: "Tokyo", clueWords: ["Japan", "Neon", "Sushi", "Shibuya", "Anime", "Akihabara", "Cherry-Blossom", "Mount-Fuji", "Tech", "Ramen", "Harajuku", "Metro"] },
    { word: "Egypt", clueWords: ["Sand", "Pyramid", "Pharaoh", "Sphinx", "Desert", "Nile", "Cairo", "Mummy", "Ancient", "Cleopatra", "Africa", "Hieroglyphics"] },
    { word: "Australia", clueWords: ["Island", "Kangaroo", "Sydney", "Opera-House", "Outback", "Koala", "Down-Under", "Reef", "Beach", "Aussie", "Mate", "Continent"] },
    { word: "Brazil", clueWords: ["Carnival", "Rio", "Soccer", "Amazon", "Samba", "Christ-Redeemer", "Beach", "Portuguese", "Rainforest", "Copa", "Yellow-Green", "South-America"] },
    { word: "China", clueWords: ["Wall", "Great", "Beijing", "Dynasty", "Dragon", "Panda", "Rice", "Forbidden-City", "Terracotta", "Silk", "Asia", "Mandarin"] },
    { word: "Italy", clueWords: ["Boot", "Pizza", "Rome", "Colosseum", "Venice", "Pasta", "Leonardo", "Vatican", "Wine", "Leaning-Tower", "Gelato", "Fashion"] },
    { word: "India", clueWords: ["Spice", "Taj-Mahal", "Curry", "Bollywood", "Gandhi", "Elephant", "Yoga", "Temple", "Color", "Cricket", "Asia", "Sari"] },
    { word: "Dubai", clueWords: ["Tall", "Burj", "Khalifa", "Luxury", "Desert", "Gold", "Mall", "Skyscraper", "UAE", "Palm", "Rich", "Modern"] },
    { word: "Hawaii", clueWords: ["Volcano", "Island", "Beach", "Aloha", "Lei", "Surf", "Paradise", "Tropical", "Luau", "Hula", "Pacific", "USA"] },
    { word: "Hollywood", clueWords: ["Film", "Movies", "Stars", "Sign", "LA", "California", "Cinema", "Celebrity", "Walk-Fame", "Studio", "Director", "Actor"] },
    { word: "Las Vegas", clueWords: ["Money", "Casino", "Gamble", "Sin-City", "Strip", "Neon", "Slot", "Poker", "Nevada", "Desert", "Show", "Luck"] },
    { word: "Moon", clueWords: ["Space", "Crater", "Apollo", "Armstrong", "Lunar", "Night", "Orbit", "NASA", "Rock", "Gray", "Earth-Satellite", "Flag"] },
    { word: "Mars", clueWords: ["Planet", "Red", "Space", "Rover", "Elon", "Fourth", "Dust", "Olympus", "Colonize", "NASA", "Alien", "Exploration"] },
    { word: "Antarctica", clueWords: ["Cold", "Penguin", "Ice", "South-Pole", "Frozen", "White", "Research", "Glacier", "Continent", "Extreme", "Seal", "Snow"] },
    { word: "Amazon Rainforest", clueWords: ["Trees", "Jungle", "Brazil", "River", "Tropical", "Green", "Wildlife", "Biodiversity", "Oxygen", "Lungs", "Dense", "Forest"] },
    { word: "Sahara Desert", clueWords: ["Hot", "Sand", "Africa", "Dry", "Dunes", "Vast", "Camel", "Scorching", "Oasis", "Largest", "Sun", "Arid"] },
    { word: "Mount Everest", clueWords: ["Peak", "Tall", "Highest", "Himalaya", "Nepal", "Climb", "Summit", "Snow", "Mountain", "Challenge", "Sherpa", "Altitude"] },
    { word: "Rome", clueWords: ["Colosseum", "Italy", "Gladiator", "Vatican", "Ancient", "Empire", "Caesar", "Forum", "Eternal-City", "Fountain", "Pasta", "History"] },
    { word: "Greece", clueWords: ["Myth", "Gods", "Athens", "Parthenon", "Zeus", "Blue-White", "Philosophy", "Olympus", "Democracy", "Island", "Santorini", "Ancient"] },
    { word: "Berlin", clueWords: ["Wall", "Germany", "Gate", "Brandenburg", "Divided", "History", "Reichstag", "Cold-War", "Reunification", "Capital", "Europe", "Memorial"] },
    { word: "Amsterdam", clueWords: ["Canal", "Netherlands", "Bike", "Tulip", "Dutch", "Van-Gogh", "Bridge", "Water", "Anne-Frank", "Liberal", "Europe", "Windmill"] },
    { word: "Grand Canyon", clueWords: ["Deep", "Arizona", "Gorge", "Colorado", "Red-Rock", "USA", "National-Park", "Vast", "Erosion", "Vista", "Hiking", "Natural"] },
    { word: "Niagara Falls", clueWords: ["Water", "Waterfall", "Canada", "USA", "Border", "Mist", "Powerful", "Horseshoe", "Rainbow", "Barrel", "Tourist", "Flow"] },
    { word: "Great Barrier Reef", clueWords: ["Coral", "Australia", "Underwater", "Colorful", "Fish", "Dive", "Ocean", "Marine", "Largest", "Ecosystem", "Snorkel", "Beautiful"] },
    { word: "Taj Mahal", clueWords: ["White", "India", "Marble", "Monument", "Love", "Dome", "Agra", "Tomb", "Beautiful", "Architecture", "Mughal", "Wonder"] },
    { word: "Machu Picchu", clueWords: ["Inca", "Peru", "Mountain", "Ruins", "Ancient", "Altitude", "Lost-City", "Stone", "Wonder", "Trek", "South-America", "Archeology"] },
    { word: "Petra", clueWords: ["Rock", "Jordan", "Treasury", "Pink", "Carved", "Ancient", "Desert", "Stone-City", "Nabatean", "Wonder", "Facade", "Archeology"] }
  ],
  "Movies": [
    { word: "Titanic", clueWords: ["Ship", "Sink", "Jack", "Rose", "Iceberg", "Leonardo", "Disaster", "Ocean", "Love-Story", "Draw-Me", "1997", "Cameron"] },
    { word: "Avatar", clueWords: ["Blue", "Pandora", "Jake", "Navi", "CGI", "Cameron", "3D", "Alien", "Tree", "Sci-Fi", "I-See-You", "Forest"] },
    { word: "Star Wars", clueWords: ["Space", "Jedi", "Force", "Lightsaber", "Vader", "Skywalker", "Solo", "Empire", "Galaxy", "Yoda", "Sith", "Sci-Fi"] },
    { word: "Harry Potter", clueWords: ["Magic", "Wizard", "Hogwarts", "Wand", "Hermione", "Ron", "Voldemort", "Spell", "House", "Scar", "Quidditch", "Potions"] },
    { word: "Avengers", clueWords: ["Team", "Superhero", "Marvel", "Iron-Man", "Thor", "Hulk", "Captain", "Assemble", "Thanos", "Infinity", "MCU", "Shield"] },
    { word: "Jurassic Park", clueWords: ["Dinosaur", "T-Rex", "Raptor", "Island", "Science", "Extinct", "Spielberg", "Amber", "DNA", "Theme-Park", "Chaos", "Life-Finds-Way"] },
    { word: "The Matrix", clueWords: ["Reality", "Neo", "Simulation", "Red-Pill", "Agent-Smith", "Bullet-Time", "Code", "Green", "Trinity", "Morpheus", "Sci-Fi", "Chosen"] },
    { word: "The Lion King", clueWords: ["Pride", "Simba", "Mufasa", "Circle-Life", "Hakuna-Matata", "Scar", "Disney", "Savanna", "King", "Animated", "Timon", "Pumbaa"] },
    { word: "Frozen", clueWords: ["Snow", "Elsa", "Anna", "Let-It-Go", "Olaf", "Ice", "Disney", "Sisters", "Cold", "Build-Snowman", "Kristoff", "Arendelle"] },
    { word: "Joker", clueWords: ["Clown", "Gotham", "Villain", "Laugh", "Joaquin", "Arthur", "Smile", "Stairs", "DC", "Society", "Purple", "Madness"] },
    { word: "The Godfather", clueWords: ["Mafia", "Corleone", "Offer", "Vito", "Family", "Italian", "Crime", "Horse-Head", "Sicily", "Don", "Gangster", "Classic"] },
    { word: "Inception", clueWords: ["Dream", "Cobb", "Layer", "Spin-Top", "Nolan", "Reality", "Limbo", "DiCaprio", "Mind", "Kick", "Subconscious", "Heist"] },
    { word: "Shrek", clueWords: ["Ogre", "Green", "Donkey", "Swamp", "Fiona", "Fairy-Tale", "DreamWorks", "Dragon", "Layers", "Lord-Farquaad", "Onion", "Animated"] },
    { word: "Toy Story", clueWords: ["Toy", "Woody", "Buzz", "Andy", "Pixar", "Cowboy", "Space-Ranger", "Infinity-Beyond", "Slinky", "Rex", "Animated", "Friend"] },
    { word: "Spider-Man", clueWords: ["Hero", "Web", "Peter-Parker", "Tobey", "Tom", "Marvel", "NYC", "Spider", "Responsibility", "Suit", "MJ", "Swing"] },
    { word: "Batman", clueWords: ["Bat", "Gotham", "Dark-Knight", "Bruce", "Wayne", "Robin", "Joker", "Cave", "DC", "Vigilante", "Cape", "Justice"] },
    { word: "Superman", clueWords: ["Krypton", "Clark", "Kent", "Cape", "S-Symbol", "Fly", "Lois", "Metropolis", "DC", "Super", "Strength", "Hero"] },
    { word: "Barbie", clueWords: ["Doll", "Pink", "Margot", "Mattel", "Ken", "Dreamhouse", "Fashion", "Plastic", "Beach", "Blonde", "2023", "Gerwig"] },
    { word: "Oppenheimer", clueWords: ["Bomb", "Atomic", "Scientist", "Manhattan", "Nolan", "Physics", "Nuclear", "Trinity", "Death", "Destroyer", "Cillian", "Biography"] },
    { word: "Lord of the Rings", clueWords: ["Ring", "Hobbit", "Frodo", "Gandalf", "Sauron", "Middle-Earth", "Precious", "Mount-Doom", "Fellowship", "One-Ring", "Aragorn", "Epic"] },
    { word: "Hunger Games", clueWords: ["Arrow", "Katniss", "Tribute", "District", "May-Odds", "Peeta", "Capitol", "Mockingjay", "Survival", "Arena", "Dystopia", "Jennifer"] },
    { word: "Twilight", clueWords: ["Vampire", "Bella", "Edward", "Werewolf", "Jacob", "Sparkle", "Forks", "Romance", "Pale", "Cullen", "Teen", "Moon"] },
    { word: "Pirates of the Caribbean", clueWords: ["Sea", "Sparrow", "Jack", "Rum", "Ship", "Compass", "Depp", "Pearl", "Treasure", "Pirate", "Curse", "Adventure"] },
    { word: "Fast and Furious", clueWords: ["Car", "Race", "Family", "Vin", "Dom", "Street", "Speed", "Drift", "Heist", "Toretto", "Quarter-Mile", "Action"] },
    { word: "Transformers", clueWords: ["Robot", "Car", "Autobots", "Decepticons", "Optimus", "Bumblebee", "Transform", "Alien", "Bay", "Metal", "Megatron", "Action"] },
    { word: "Indiana Jones", clueWords: ["Whip", "Archeology", "Adventure", "Hat", "Harrison", "Temple", "Ark", "Grail", "Treasure", "Professor", "Nazi", "Explorer"] },
    { word: "Black Panther", clueWords: ["Wakanda", "Marvel", "T'Challa", "Vibranium", "Africa", "Suit", "King", "Superhero", "Forever", "Shuri", "Chadwick", "MCU"] },
    { word: "Forrest Gump", clueWords: ["Run", "Chocolate", "Box", "Feather", "Tom-Hanks", "Bench", "Jenny", "Shrimp", "Alabama", "Stupid", "Vietnam", "Inspire"] },
    { word: "Back to the Future", clueWords: ["Time", "DeLorean", "Marty", "Doc", "1985", "1955", "Clock-Tower", "88mph", "Flux-Capacitor", "Lightning", "Sci-Fi", "Hoverboard"] },
    { word: "Coco", clueWords: ["Music", "Guitar", "Miguel", "Mexico", "Dead", "Pixar", "Skeleton", "Family", "Remember-Me", "Dia-Muertos", "Animated", "Marigold"] }
  ],
  "The Boys": [
    // Sri Lankan Animals
    { word: "Elephant", clueWords: ["Trunk", "Tusks", "Perahera", "Gathering", "Dumbo", "Minnerya", "Gentle", "Ivory", "Orphanage", "Pinnawala", "Large", "Mammal"] },
    { word: "Leopard", clueWords: ["Yala", "Spots", "Predator", "Wilpattu", "Cat", "Hunter", "Carnivore", "Tree", "Elusive", "Big-Cat", "Sri-Lanka", "Kotiya"] },
    { word: "Sloth Bear", clueWords: ["Baloo", "Yala", "Black", "Shaggy", "Insects", "Claws", "Termites", "Wild", "Bear", "Forest", "Honey", "Native"] },
    { word: "Blue Whale", clueWords: ["Mirissa", "Ocean", "Largest", "Mammal", "Marine", "Deep", "Big", "Tail", "Blowhole", "Sea", "Krill", "Giant"] },
    { word: "Toque Macaque", clueWords: ["Monkey", "Rilawa", "Temple", "Troop", "Nuisance", "Hairstyle", "Endemic", "Primate", "Tree", "Small", "Curious", "Brown"] },
    { word: "Cobra", clueWords: ["Snake", "Hood", "Venom", "Naya", "Reptile", "Dance", "Charmer", "Dangerous", "Fangs", "Hiss", "Basket", "Poison"] },
    { word: "Peacock", clueWords: ["Feathers", "Dance", "Rain", "Blue", "Bird", "Colorful", "Tail", "Monara", "Beautiful", "Eyes", "Fan", "Kataragama"] },
    { word: "Sea Turtle", clueWords: ["Hikkaduwa", "Shell", "Eggs", "Beach", "Ocean", "Swim", "Hatchery", "Slow", "Ancient", "Reptile", "Sand", "Conservation"] },
    { word: "Sambar Deer", clueWords: ["Horton-Plains", "Elk", "Horns", "Grass", "Forest", "Large", "Herd", "Animal", "Brown", "Grazing", "Nature", "Wild"] },
    { word: "Water Buffalo", clueWords: ["Curd", "Mud", "Horns", "Farm", "Milk", "Plough", "Field", "Heavy", "Black", "Village", "Cattle", "Yala"] },

    // Sri Lankan Foods
    { word: "Kottu", clueWords: ["Roti", "Chop", "Spicy", "Street-Food", "Cheese", "Chicken", "Vegetables", "Dinner", "Waitrose", "Beat", "Metal-Plate", "Famous"] },
    { word: "Hoppers", clueWords: ["Bowl", "Crispy", "Egg", "Breakfast", "Aappa", "Coconut-Milk", "Rice-Flour", "Pan", "Dinner", "Sri-Lanka", "Round", "Soft-Center"] },
    { word: "Milk Rice", clueWords: ["Kiribath", "New-Year", "Diamond", "Square", "Coconut-Milk", "Breakfast", "Lunu-Miris", "Celebration", "White", "Sticky", "Tradition", "First-Meal"] },
    { word: "String Hoppers", clueWords: ["Idiyappa", "Noodles", "Steamed", "Breakfast", "Mats", "Rice-Flour", "Sammbal", "Hodiri", "Lacay", "Press", "White", "Red"] },
    { word: "Pol Sambol", clueWords: ["Coconut", "Chili", "Orange", "Spicy", "Lime", "Onion", "Side-Dish", "Rice", "Bread", "Scraped", "Mortar", "Popular"] },
    { word: "Watalappan", clueWords: ["Dessert", "Brown", "Jaggery", "Spices", "Egg", "Ramadan", "Sweet", "Pudding", "Cashew", "Steamed", "Malay", "Delicious"] },
    { word: "Curd", clueWords: ["Buffalo", "Treacle", "White", "Clay-Pot", "Yoghurt", "Dessert", "Sour", "Sweet", "Tissamaharama", "Spoon", "Creamy", "Milk"] },
    { word: "Kokis", clueWords: ["Crispy", "Yellow", "Fried", "Pattern", "Oil", "New-Year", "Avurudu", "Shape", "Crunchy", "Snack", "Traditional", "Sweet"] },
    { word: "Kavum", clueWords: ["Oil-Cake", "Top-Knot", "Brown", "Fried", "Sweet", "Avurudu", "Flour", "Treacle", "Traditional", "Konda", "New-Year", "Deep-Fried"] },
    { word: "King Coconut", clueWords: ["Thambili", "Orange", "Drink", "Refresh", "Tree", "Sweet", "Water", "Natural", "Straw", "Cool", "Healthy", "Roadside"] },
    { word: "Woodapple", clueWords: ["Shell", "Hard", "Juice", "Smell", "Elephant", "Sour", "Cream", "Brown", "Fruit", "Divul", "Drink", "Seasonal"] },
    { word: "Faluda", clueWords: ["Pink", "Drink", "Rose", "Ice-Cream", "Seeds", "Sweet", "Milk", "Glass", "Cold", "Jelly", "Dessert", "Syrup"] },
    { word: "Short Eats", clueWords: ["Rolls", "Patties", "Cutlets", "Pastry", "Bakery", "Spicy", "Snack", "Fried", "Fish-Bun", "Tea-Time", "Party", "Bite"] },
    { word: "Fish Bun", clueWords: ["Maalu-Paan", "Triangle", "Bakery", "Spicy", "Potato", "Fish", "Bread", "Snack", "Soft", "Vegetable", "Oven", "Popular"] },
    { word: "Lamprais", clueWords: ["Banana-Leaf", "Dutch", "Burgher", "Rice", "Curry", "Baked", "Packet", "Egg", "Frikkadels", "Mixed", "Flavor", "Special"] },

    // Sri Lankan Brands
    { word: "Dialog", clueWords: ["Phone", "Sim", "Red", "Network", "Internet", "Data", "Connection", "MyDialog", "Mobile", "Signal", "Coverage", "Telecom"] },
    { word: "Munchee", clueWords: ["Biscuits", "Yellow", "Super-Cream", "Cracker", "Lemon-Puff", "Choc-Shock", "Snack", "Tikiri", "Marie", "Brand", "Eat", "Tea"] },
    { word: "Maliban", clueWords: ["Biscuits", "White", "Lemon-Puff", "Gold-Marie", "Chick", "Quality", "Tradition", "Snack", "Tea", "Milk", "Brand", "Cream"] },
    { word: "Keells", clueWords: ["Supermarket", "Green", "Shopping", "Food", "Sausages", "Bakery", "Fresh", "Groceries", "Store", "Meat", "Brand", "K-Zone"] },
    { word: "Cargills", clueWords: ["Food-City", "Red", "Supermarket", "KFC", "Ice-Cream", "Magic", "Groceries", "Shopping", "Bank", "Old", "Building", "Retail"] },
    { word: "Elephant House", clueWords: ["Ice-Cream", "Soda", "Ginger-Beer", "EGB", "Sausages", "Hot-Dog", "Cream-Soda", "Vanilla", "Brand", "Beverage", "Cool", "Tasty"] },
    { word: "Siddhalepa", clueWords: ["Balm", "Smell", "Herbal", "Ayurveda", "Yellow", "Pain", "Headache", "Cold", "Rub", "Jar", "Medicine", "Famous"] },
    { word: "Sunlight", clueWords: ["Soap", "Yellow", "Wash", "Clothes", "Clean", "Smell", "Laundry", "Bar", "Foam", "Detergent", "Trusted", "Household"] },
    { word: "Samaposha", clueWords: ["Breakfast", "Cereal", "Grains", "Healthy", "Balls", "Coconut", "Children", "Green", "Packet", "Energy", "Morning", "Nutritious"] },
    { word: "Singer", clueWords: ["Sewing", "Machine", "Electronics", "Red", "Home", "Appliances", "TV", "Fridge", "Trusted", "Sri-Lanka", "Store", "Shop"] },

    // Objects
    { word: "Tuktuk", clueWords: ["Three-Wheeler", "Ride", "Taxi", "Taxi", "Driver", "Meter", "Bajaj", "Green", "Road", "Traffic", "Small", "Transport"] },
    { word: "Saree", clueWords: ["Osariya", "Kandyan", "Silk", "Women", "Dress", "Unwrap", "Fabric", "Traditional", "Wedding", "Teacher", "Beautiful", "Drape"] },
    { word: "Sarong", clueWords: ["Men", "Checkered", "Cloth", "Wrap", "Comfort", "Home", "Sleep", "Pocket", "Waist", "Traditional", "Knot", "Wear"] },
    { word: "Geta Bera", clueWords: ["Drum", "Kandyan", "Dance", "Beat", "Music", "Traditional", "Hands", "Rhythm", "Wood", "Percussion", "Culture", "Sound"] },
    { word: "Wes Muhuna", clueWords: ["Mask", "Traditional", "Dance", "Kandyan", "Face", "Colorful", "Costume", "Culture", "Ritual", "Wood", "Headgear", "Performance"] },
    { word: "Clay Pot", clueWords: ["Cooking", "Chatti", "Mud", "Fire", "Traditional", "Curry", "Kitchen", "Earthenware", "Red", "Spoon", "Flavor", "Rural"] },
    { word: "Oil Lamp", clueWords: ["Brass", "Wick", "Coconut-Oil", "Light", "Temple", "Festival", "Traditional", "Pahana", "Flame", "Bright", "Blessing", "Ceremony"] },
    { word: "Betel Leaf", clueWords: ["Green", "Chew", "Arecanut", "Red-Mouth", "Tradition", "Elders", "Bulath", "Offering", "Sheaf", "Welcome", "Spicy", "Heart-Shape"] },
    { word: "Mosquito Coil", clueWords: ["Smoke", "Green", "Spiral", "Burn", "Repel", "Insect", "Night", "Smell", "Stand", "Fire", "Ash", "Protection"] },
    { word: "Carrom", clueWords: ["Board", "Game", "Striker", "Powder", "Chips", "Coins", "Red", "Pockets", "Fingers", "Flick", "Queen", "Play"] },
    { word: "Cricket Bat", clueWords: ["Willow", "Wood", "Hit", "Ball", "Six", "Four", "Game", "Sport", "Handle", "Players", "Match", "Popular"] },
    { word: "School Van", clueWords: ["Yellow", "Kids", "Transport", "Morning", "Traffic", "Driver", "Bag", "School", "Ride", "Horn", "Pick-up", "Crowded"] },
    { word: "Lottery Ticket", clueWords: ["Mahajana", "Win", "Luck", "Numbers", "Draw", "Paper", "Govisetha", "Money", "Prize", "Buy", "Chance", "Scratch"] },

    // Popular Places
    { word: "Sigiriya", clueWords: ["Rock", "Lion", "Fortress", "Frescoes", "Climb", "King", "Kasyapa", "Mirror-Wall", "Steps", "Paws", "Ancient", "Palace"] },
    { word: "Temple of Tooth", clueWords: ["Kandy", "Dalada", "Maligawa", "Buddha", "Gold", "Lake", "Perahera", "Relic", "White", "Worship", "Sacred", "Buddhism"] },
    { word: "Galle Fort", clueWords: ["Dutch", "Ramparts", "Lighthouse", "Sea", "Old", "Architecture", "Walk", "Streets", "History", "South", "Cannon", "UNESCO"] },
    { word: "Ella", clueWords: ["Train", "Nine-Arch", "Bridge", "Mountains", "Hiking", "Tourist", "View", "Green", "Tea", "Little-Adam", "Mist", "Cool"] },
    { word: "Nuwara Eliya", clueWords: ["Little-England", "Tea", "Cold", "Mist", "Strawberries", "Lake", "Gregory", "Flowers", "Hills", "Coat", "Colonial", "Golf"] },
    { word: "Yala", clueWords: ["Safari", "Leopard", "Jeep", "Park", "Animals", "Wild", "Bear", "Elephant", "Nature", "Dust", "Dry", "Adventure"] },
    { word: "Anuradhapura", clueWords: ["Ruins", "Dagoba", "Ancient", "Tree", "Bodhi", "Capital", "History", "Stupa", "White", "Kings", "Pilgrimage", "North"] },
    { word: "Adam's Peak", clueWords: ["Sri-Pada", "Footprint", "Steps", "Climb", "Night", "Sunrise", "Pilgrim", "Butterfly", "Mountain", "Sacred", "Season", "Cold"] },
    { word: "Mirissa", clueWords: ["Whales", "Beach", "Surf", "South", "Coconut", "Tree-Hill", "Relax", "Ocean", "Dolphins", "Party", "Sand", "Sun"] },
    { word: "Jaffna", clueWords: ["North", "Library", "Fort", "Palmyrah", "Hot", "Temple", "Nallur", "Culture", "Mango", "Crab", "Peninsula", "Tamil"] },
    { word: "Arugam Bay", clueWords: ["Surf", "East", "Waves", "Beach", "Sun", "Sand", "Point", "Tourist", "Relax", "Board", "Ocean", "Season"] },
    { word: "Pinnawala", clueWords: ["Elephant", "Orphanage", "River", "Bath", "Baby", "Milk", "Feeding", "See", "Tourists", "Herd", "Water", "Conservation"] },
    { word: "Dambulla", clueWords: ["Cave", "Temple", "Golden", "Buddha", "Statues", "Painting", "Rock", "Climb", "History", "Ancient", "Heritage", "Religious"] },
    { word: "Horton Plains", clueWords: ["Worlds-End", "Drop", "Walk", "Cold", "Deer", "Grass", "Park", "Mist", "Nature", "Trek", "Bakers-Falls", "Plateau"] },
    { word: "Unawatuna", clueWords: ["Beach", "Bay", "Swim", "Pagoda", "Tourist", "Sand", "Restaurants", "Blue", "Relax", "Sun", "Galle", "Popular"] },

    // Expansion Set 1
    // Animals
    { word: "Jungle Fowl", clueWords: ["National", "Bird", "Colors", "Forest", "Rooster", "Crow", "Endemic", "Beautiful", "Wild", "Chicken", "Feathers", "Comb"] },
    { word: "Giant Squirrel", clueWords: ["Dandu-Lena", "Tree", "Large", "Tail", "Jump", "Rodent", "Forest", "Endemic", "Seeds", "Climb", "Nature", "Furry"] },
    { word: "Mongoose", clueWords: ["Snake", "Fight", "Furry", "Fast", "Cobra", "Garden", "Hunter", "Brown", "Small", "Bush", "Teeth", "Quick"] },
    { word: "Gecko", clueWords: ["Huna", "Wall", "Tail", "House", "Sound", "Lizard", "Click", "Insect", "Small", "Climb", "Ceiling", "Reptile"] },
    { word: "Star Tortoise", clueWords: ["Shell", "Pattern", "Slow", "Wana-Kibula", "Garden", "Vegetable", "Hard", "Dry-Zone", "Pet", "Unique", "Walk", "Hiding"] },

    // Foods
    { word: "Pol Roti", clueWords: ["Coconut", "Flatbread", "Lunu-Miris", "Breakfast", "Hard", "Round", "Pan", "Onion", "Chili", "Dough", "Tea", "Morning"] },
    { word: "Pittu", clueWords: ["Bamboo", "Steamed", "Coconut", "Rice-Flour", "Tube", "Cylinder", "Milk", "Lunu-Miris", "Breakfast", "Layer", "Tamil", "Crumbly"] },
    { word: "Achcharu", clueWords: ["Pickle", "Spicy", "Sour", "Fruit", "Vinegar", "Chili", "Mango", "Amberella", "Street-Food", "Jar", "Taste", "Mix"] },
    { word: "Ambul Thiyal", clueWords: ["Fish", "Sour", "Black", "Curry", "Goraka", "Southern", "Clay-Pot", "Spicy", "Dry", "Preserve", "Rice", "Traditional"] },
    { word: "Kalu Dodol", clueWords: ["Sweet", "Black", "Oily", "Hambantota", "Muscat", "Coconut-Milk", "Jaggery", "Stir", "Sticky", "Dessert", "Rice-Flour", "Famous"] },
    { word: "Thala Guli", clueWords: ["Sesame", "Balls", "Sweet", "Jaggery", "Kandy", "Paper", "Wrapped", "Snack", "Souvenir", "Traditional", "Yummy", "Small"] },
    { word: "Asmi", clueWords: ["White", "Web", "Fried", "Syrup", "Pink", "Avurudu", "Sweet", "Pattern", "Crispy", "Rice-Flour", "Oil", "Fancy"] },
    { word: "Bibikkan", clueWords: ["Coconut", "Cake", "Dark", "Sweet", "Jaggery", "Dates", "Spices", "Baked", "Traditional", "Rich", "Soft", "Tea"] },
    { word: "Milo", clueWords: ["Green", "Drink", "Chocolate", "Malt", "Energy", "School", "Sports", "Carton", "Cold", "Nestle", "Kids", "Popular"] },
    { word: "Tipitip", clueWords: ["Balls", "Green", "Onion", "Snack", "Corn", "Packet", "Crunchy", "Kids", "School", "Shop", "Cheap", "Tasty"] },

    // Brands
    { word: "Mobitel", clueWords: ["Green", "Phone", "Network", "Sim", "Data", "Connection", "Telecom", "Signal", "Mobile", "Internet", "Sri-Lanka", "Call"] },
    { word: "SLT", clueWords: ["Telephone", "Landline", "Internet", "Fiber", "Telecom", "Blue", "Connection", "Bill", "Router", "National", "Phone", "Wire"] },
    { word: "Hutch", clueWords: ["Orange", "Sim", "Cheap", "Data", "Packages", "Phone", "Mobile", "Network", "Youth", "Call", "Internet", "078"] },
    { word: "Arpico", clueWords: ["Supercenter", "Blue", "Shopping", "Furniture", "Large", "Store", "Variety", "Tires", "Plastics", "Water-Tank", "Mall", "Buy"] },
    { word: "Sampath Bank", clueWords: ["Orange", "Bank", "Money", "Card", "Vishwa", "Account", "Save", "Loan", "ATM", "Finance", "Local", "Service"] },
    { word: "BOC", clueWords: ["Yellow", "Bank", "Ceylon", "Government", "Old", "Money", "Tower", "Branch", "Savings", "Loan", "National", "Trust"] },
    { word: "HNB", clueWords: ["Hatton", "Yellow", "Elephant", "Bank", "Money", "ATM", "Private", "Account", "Finance", "Card", "Digital", "Service"] },
    { word: "Commercial Bank", clueWords: ["Blue", "Bank", "Money", "ATM", "ComBank", "Account", "Finance", "Loan", "Online", "Card", "Private", "Largest"] },
    { word: "Ceylinco", clueWords: ["Insurance", "Protection", "Life", "VIP", "On-The-Spot", "Car", "Health", "Red", "Building", "Policy", "Cover", "Safe"] },
    { word: "Softlogic", clueWords: ["Odel", "Hospital", "Burger-King", "Electronics", "Store", "Brands", "Insurance", "Finance", "Retail", "Group", "Phones", "Diverse"] },

    // Objects
    { word: "Coconut Scraper", clueWords: ["Hiramanaya", "Blade", "Kitchen", "Sit", "Tool", "White", "Fresh", "Pol", "Cooking", "Round", "Iron", "Wood"] },
    { word: "Mortar Pestle", clueWords: ["Wangeriya", "Stone", "Pound", "Grind", "Kitchen", "Spice", "Heavy", "Miris", "Traditional", "Crush", "Tool", "Hard"] },
    { word: "Winnowing Fan", clueWords: ["Kulla", "Rice", "Clean", "Woven", "Cane", "Kitchen", "Traditional", "Paddy", "Dust", "Shake", "Shape", "Rural"] },
    { word: "Mat", clueWords: ["Padura", "Sleep", "Reed", "Woven", "Floor", "Roll", "Sit", "Pattern", "Traditional", "Village", "Rest", "Cool"] },
    { word: "Broom", clueWords: ["Kozza", "Sweep", "Coconut", "Ekel", "Clean", "Dust", "Garden", "Floor", "Handle", "Stick", "Morning", "Chores"] },
    { word: "Tiffin", clueWords: ["Lunch", "Box", "Metal", "Stack", "Food", "Carry", "School", "Office", "Layers", "Handle", "Warm", "Meal"] },
    { word: "Vesak Lantern", clueWords: ["Light", "Paper", "Bamboo", "Colorful", "Structure", "Koodu", "Full-Moon", "Festival", "Decorate", "Night", "Buddhism", "Candle"] },
    { word: "Oil Lamp", clueWords: ["Brass", "Wick", "Fire", "Temple", "Light", "Tradition", "Ceremony", "Pahana", "Blessing", "Clay", "Opening", "Festival"] },
    { word: "School Uniform", clueWords: ["White", "Dress", "Blue-Shorts", "School", "Tie", "Badge", "Shoes", "Socks", "Students", "Morning", "Clean", "Iron"] },
    { word: "Exercise Book", clueWords: ["School", "Write", "Monitor", "Lines", "Paper", "Cover", "Homework", "Notes", "Pen", "Learn", "Page", "Class"] },

    // Places
    { word: "Trincomalee", clueWords: ["Harbor", "Koneswaram", "Beach", "Nilaveli", "East", "Pigeon-Island", "Hot-Wells", "Deer", "Navy", "Temple", "Blue", "Swim"] },
    { word: "Polonnaruwa", clueWords: ["Ruins", "Ancient", "Kingdom", "Statues", "Bicycles", "Gal-Vihara", "History", "Stone", "Parakrama", "Samudra", "Dry", "Kings"] },
    { word: "Sinharaja", clueWords: ["Rainforest", "Trees", "Leeches", "Green", "Water", "Birds", "Endemic", "Walk", "Nature", "UNESCO", "Wet", "Dense"] },
    { word: "Kalpitiya", clueWords: ["Kitesurfing", "Dolphins", "Lagoon", "Wind", "Beach", "Salt", "Puthalam", "Boats", "Sea", "Sand", "Turist", "Peninsula"] },
    { word: "Negombo", clueWords: ["Fish-Market", "Beach", "Airport", "Boats", "Catholic", "Church", "Lagoon", "Tile", "Catamaran", "Sea", "Tourists", "Busy"] },
    { word: "Kandy", clueWords: ["Lake", "Temple", "Tooth", "Hill", "Peradeniya", "Traffic", "Perahera", "City", "Cool", "Central", "Culture", "Kingdom"] },
    { word: "Kitulgala", clueWords: ["Rafting", "River", "Kelani", "Movie", "Bridge", "Water", "Adventure", "Rain", "Forest", "Nature", "Paddle", "Wet"] },
    { word: "Batticaloa", clueWords: ["Lagoon", "Singing-Fish", "East", "Fort", "Hot", "Bridge", "Kallady", "Prawns", "Tamil", "Crab", "Beach", "Quiet"] },
    { word: "Pasikudah", clueWords: ["Beach", "Shallow", "Blue", "Swim", "Resorts", "East", "Sand", "Coral", "Relax", "Sun", "Bay", "Holiday"] },
    { word: "Knuckles", clueWords: ["Mountain", "Range", "Hike", "Mist", "Fist", "Nature", "Forest", "River", "Camping", "Cold", "View", "Central"] },

    // Expansion Set 2 (Massive Additions)
    // More Foods
    { word: "Lavariya", clueWords: ["String-Hoppers", "Sweet", "Coconut", "Pani", "Stuffed", "Roll", "Tea-Time", "Snack", "Traditional", "Soft", "Yummy", "White"] },
    { word: "Helapa", clueWords: ["Kenda-Leaf", "Steamed", "Kurakkan", "Sweet", "Flat", "Brown", "Dough", "Traditional", "Healthy", "Snack", "Village", "Wrapper"] },
    { word: "Pani Walalu", clueWords: ["Undu", "Syrup", "Coils", "Fried", "Sweet", "Juicy", "Avurudu", "Orange", "Soaked", "Sticky", "Treat", "Round"] },
    { word: "Sowboro", clueWords: ["Biscuit", "Crunchy", "Baker", "Van", "Round", "Sweet", "Cheap", "Snack", "Tea", "Dry", "Hard", "Popular"] },
    { word: "Seeni Sambol", clueWords: ["Onion", "Sweet", "Spicy", "Caramelized", "Brown", "Bread", "Hoppers", "Side-Dish", "Cardamom", "Fried", "Tasty", "Relish"] },
    { word: "Kiri Hodi", clueWords: ["Coconut-Milk", "Yellow", "Gravy", "Turmeric", "Fenugreek", "String-Hoppers", "Mild", "Soup", "Liquid", "Lime", "Curry", "Base"] },
    { word: "Polos", clueWords: ["Jackfruit", "Baby", "Curry", "Spicy", "Rice", "Traditional", "Village", "Cooked", "Brown", "Meaty", "Texture", "Dish"] },
    { word: "Dhal Curry", clueWords: ["Lentils", "Yellow", "Parippu", "Curry", "Rice", "Bread", "Coconut-Milk", "Mustard", "Daily", "Soft", "Protein", "Staple"] },
    { word: "Isso Wade", clueWords: ["Prawns", "Lentil", "Fried", "Galle-Face", "Street-Food", "Spicy", "Crunchy", "Snack", "Beach", "Orange", "Disk", "Hot"] },
    { word: "Batu Moju", clueWords: ["Eggplant", "Brinjal", "Pickle", "Sweet", "Sour", "Dark", "Fried", "Rice", "Wedding", "Side-Dish", "Jar", "Preserve"] },

    // More Brands
    { word: "Ritzbury", clueWords: ["Chocolate", "Pebbles", "Chit-Chat", "Sweet", "Brand", "Sri-Lanka", "Melts", "Brown", "Confectionery", "Kids", "Tasty", "Snack"] },
    { word: "Kandos", clueWords: ["Chocolate", "Cashew", "Delta", "Red", "Gold", "Bar", "Sweet", "Old", "Brand", "Cocoa", "Gift", "Classic"] },
    { word: "Astra", clueWords: ["Margarine", "Butter", "Yellow", "Tub", "Bread", "Cake", "Bake", "Spread", "Morning", "Vitamins", "Cooking", "Fat"] },
    { word: "Prima", clueWords: ["Noodles", "Kottu-Mee", "Flour", "Bread", "Wheat", "Chicken", "Sausages", "Top-Ramen", "Hot", "Spicy", "Instant", "Cup"] },
    { word: "Clogard", clueWords: ["Toothpaste", "Clove", "Brush", "Teeth", "Clean", "Spicy", "Smile", "Oral", "Hygiene", "Morning", "Paste", "Tube"] },
    { word: "Signal", clueWords: ["Toothpaste", "Red", "White", "Smile", "Strong", "Teeth", "Brush", "Cavity", "Fluoride", "Clean", "Tube", "Brand"] },
    { word: "Dettol", clueWords: ["Antiseptic", "Liquid", "Green", "Germs", "Clean", "Wash", "Smell", "Soap", "Cut", "Safety", "Health", "Hospital"] },
    { word: "Lifebuoy", clueWords: ["Soap", "Red", "Germs", "Wash", "Bath", "Clean", "Hand", "Protect", "Health", "Lather", "Smell", "Bar"] },
    { word: "Rinso", clueWords: ["Washing", "Powder", "Clothes", "Clean", "Foam", "Laundry", "Bucket", "White", "Staines", "Detergent", "Smell", "Fresh"] },
    { word: "Sunlight", clueWords: ["Soap", "Yellow", "Wash", "Clothes", "Bar", "Laundry", "Clean", "Foam", "Lemon", "Domestic", "Trusted", "Sri-Lanka"] },
    { word: "Diva", clueWords: ["Washing", "Powder", "Flowers", "Smell", "Lime", "Jasmine", "Clothes", "Clean", "Laundry", "Cheap", "Packet", "Foam"] },

    // More Objects
    { word: "Miris Gala", clueWords: ["Grinding", "Stone", "Roll", "Spices", "Kitchen", "Traditional", "Heavy", "Flat", "Crush", "Manual", "Sambol", "Paste"] },
    { word: "Arecanut Cutter", clueWords: ["Giraya", "Metal", "Betel", "Cut", "Sharp", "Tool", "Brass", "Traditional", "Design", "Shape", "Hand", "Old"] },
    { word: "Spitz", clueWords: ["Broom", "Ekel", "Garden", "Sweep", "Leaves", "Clean", "Stick", "Bundle", "Outdoor", "Hard", "Scratch", "Pile"] },
    { word: "Wangediya", clueWords: ["Mortar", "Stone", "Pound", "Rice", "Flour", "Kitchen", "Heavy", "Deep", "Pole", "Crush", "Traditional", "Beat"] },
    { word: "Kerosene Lamp", clueWords: ["Bottle", "Wick", "Light", "Flame", "Glass", "Kuppiya", "Night", "Dark", "Rural", "Fire", "Small", "Dim"] },
    { word: "Slate", clueWords: ["Gal-Leella", "Write", "Chalk", "School", "Old", "Learn", "Alphabet", "Erase", "Black", "Frame", "Kids", "Practice"] },
    { word: "Cane Basket", clueWords: ["Woven", "Wood", "Carry", "Fruits", "Vegetables", "Market", "Handle", "Natural", "Storage", "Brown", "Light", "Box"] },

    // More Animals
    { word: "Blue Magpie", clueWords: ["Bird", "Blue", "Red-Beak", "Long-Tail", "Forest", "Endemic", "Colorful", "Beautiful", "Rare", "Sinharaja", "Wings", "Fly"] },
    { word: "Hornbill", clueWords: ["Bird", "Beak", "Large", "Grey", "Fruit", "Tree", "Pair", "Wings", "Cashew", "Fly", "Forest", "Unique"] },
    { word: "Crocodile", clueWords: ["River", "Teeth", "Reptile", "Water", "Swamp", "Dangerous", "Scales", "Tail", "Hunter", "Ambush", "Sun", "Kimbula"] },
    { word: "Wild Boar", clueWords: ["Pig", "Forest", "Tusks", "Black", "Hog", "Dig", "Roots", "Dangerous", "Crop", "Run", "Group", "Wild"] },
    { word: "Monitor Lizard", clueWords: ["Thalagoya", "Tongue", "Claws", "Tail", "Garden", "Reptile", "Large", "Dragon", "Scale", "Climb", "Slow", "Harmless"] },
    { word: "Porcupine", clueWords: ["Quills", "Spikes", "Sharp", "Night", "Rodent", "Defense", "Forest", "Dig", "Roots", "Itawa", "Animal", "Small"] },
    { word: "Palm Civet", clueWords: ["Uguuduwa", "Roof", "Night", "Cat", "Smell", "Noise", "Ceiling", "Tail", "Eyes", "Pest", "Fruit", "Jump"] },

    // More Places
    { word: "Kataragama", clueWords: ["Temple", "God", "Skanda", "Pilgrimage", "South", "Holy", "River", "Puja", "Fruits", "Vow", "Sacred", "Multi-faith"] },
    { word: "Bandarawela", clueWords: ["Hills", "Cool", "Tea", "Town", "Climate", "Market", "Badulla", "Mountains", "Relax", "Holiday", "Green", "Mist"] },
    { word: "Bambarakanda", clueWords: ["Waterfall", "Highest", "Tall", "Water", "Drop", "Mist", "Hike", "View", "Nature", "Cool", "Rock", "Stream"] },
    { word: "Dunhinda", clueWords: ["Waterfall", "Smoke", "Badulla", "Spray", "Mist", "Walk", "Nature", "Loud", "Water", "Beautiful", "Stream", "Famous"] },
    { word: "Hummanaya", clueWords: ["Blowhole", "Sea", "Spray", "Water", "High", "Rock", "South", "Natural", "Fountain", "Pressure", "Ocean", "Unique"] },
    { word: "Delft Island", clueWords: ["Jaffna", "Ponies", "Wild", "Horses", "Coral", "Dutch", "Fort", "Remote", "Boat", "Dry", "Baobab", "Tree"] },
    { word: "Madu Church", clueWords: ["Shrine", "Mannar", "Catholic", "Feast", "August", "Pilgrim", "Pray", "Statue", "Mary", "Holy", "Jungle", "Peace"] },
    { word: "Galle Face", clueWords: ["Green", "Colombo", "Beach", "Kites", "Sunset", "Walk", "Nana", "Iso-Wade", "Ocean", "City", "Crowd", "Evening"] },
    { word: "Lotus Tower", clueWords: ["Colombo", "Tall", "Flower", "Green", "Pink", "View", "Observation", "City", "Landmark", "Communication", "New", "Lights"] },
    { word: "Independence Square", clueWords: ["Colombo", "Hall", "Pillars", "Lions", "Walk", "jogging", "White", "Stone", "History", "Freedom", "Monument", "Park"] },
    { word: "Viharamahadevi Park", clueWords: ["Park", "Colombo", "Trees", "Buddha", "Golden", "Walk", "Playground", "Green", "City", "Relax", "Fountain", "Horses"] },
    { word: "Dehiwala Zoo", clueWords: ["Animals", "Cages", "Lion", "Elephant", "Show", "Fish", "Birds", "Kids", "Walk", "Garden", "Colombo", "Visit"] },
    { word: "Botanical Gardens", clueWords: ["Peradeniya", "Kandy", "Flowers", "Trees", "Orchids", "Walk", "Green", "Palm", "Beautiful", "Nature", "Picnic", "Huge"] },
    { word: "Nine Arch Bridge", clueWords: ["Ella", "Train", "Sone", "Brick", "Curved", "Architecture", "Valley", "Tea", "Photo", "Tourist", "Railway", "British"] },
    { word: "Fort Railway Station", clueWords: ["Train", "Colombo", "Busy", "Tracks", "Platform", "Ticket", "Commute", "Crowd", "Building", "Start", "Journey", "Hub"] },
    { word: "Pettah", clueWords: ["Market", "Colombo", "Busy", "Shops", "Crowd", "Streets", "Bargain", "Wholesale", "Red-Mosque", "Noise", "Traffic", "Items"] }
  ]
};

// Use Buffer for base64 encoding in Node.js
const encoded = Buffer.from(JSON.stringify(RAW_DATA)).toString('base64');

const fileContent = `
// This file contains the protected game content.
// The data is Base64 encoded to prevent casual inspection.

// Helper to decode data
const decodeData = (encoded: string) => {
  try {
    return JSON.parse(atob(encoded));
  } catch (e) {
    console.error("Failed to decode game data", e);
    return {};
  }
};

// THE PROTECTED DATA BLOB
const PROTECTED_DATA_STRING = "${encoded}";

let cachedData: Record<string, Array<{ word: string, clueWords: string[] }>> | null = null;

// ============================================
// IMPROVED RANDOMIZATION WITH HISTORY TRACKING
// ============================================

// Store recently used words per category to prevent immediate repetition
// Format: { "categoryName": ["word1", "word2", ...] }
const recentlyUsedWords: Record<string, string[]> = {};

// Store shuffle bags per category for better distribution
// Format: { "categoryName": [indices...] }
const shuffleBags: Record<string, number[]> = {};

/**
 * Fisher-Yates shuffle algorithm for array shuffling
 * Ensures uniform random distribution
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Get a shuffled bag of indices for a category
 * This ensures every word gets seen before repetition
 */
const getShuffleBag = (category: string, totalWords: number): number[] => {
  if (!shuffleBags[category] || shuffleBags[category].length === 0) {
    // Create a new shuffled bag with all word indices
    const indices = Array.from({ length: totalWords }, (_, i) => i);
    shuffleBags[category] = shuffleArray(indices);
  }
  return shuffleBags[category];
};

/**
 * Improved word selection with history tracking and shuffle bag algorithm
 * Prevents getting the same word until a majority of words have been seen
 * 
 * SPECIAL HANDLING FOR "The Boys" CATEGORY:
 * "The Boys" has multiple subcategories mixed together. When this category
 * is selected, we randomly pick from one of the subcategories to get variety.
 */
export const getGameContent = (category: string): { word: string, associationWord: string } => {
  if (!cachedData) {
    cachedData = decodeData(PROTECTED_DATA_STRING);
  }

  let categoryData = cachedData?.[category] || [];
  
  if (categoryData.length === 0) {
    // Fallback if category empty or not found
    return { word: "Error", associationWord: "Error" };
  }

  // SPECIAL HANDLING FOR "The Boys" CATEGORY
  // The Boys category contains multiple subcategories that should be randomly selected
  if (category === "The Boys") {
    // Define subcategory ranges based on the data structure
    const subcategories = [
      { name: "Sri Lankan Animals", start: 0, end: 9 },      // Elephant to Water Buffalo (10 items)
      { name: "Sri Lankan Foods", start: 10, end: 25 },      // Kottu to Lamprais (16 items)
      { name: "Sri Lankan Brands", start: 26, end: 36 },     // Dialog to Singer (11 items)
      { name: "Objects", start: 37, end: 52 },               // Tuktuk to Lottery Ticket (16 items)
      { name: "Popular Places", start: 53, end: 69 },        // Sigiriya to Unawatuna (17 items)
      { name: "More Animals", start: 70, end: 76 },          // Jungle Fowl to Palm Civet (7 items)
      { name: "More Foods", start: 77, end: 86 },            // Pol Roti to Tipitip (10 items)
      { name: "More Brands", start: 87, end: 96 },           // Mobitel to Diva (10 items)
      { name: "More Objects", start: 97, end: 103 },         // Coconut Scraper to Exercise Book (7 items)
      { name: "More Places", start: 104, end: 113 },         // Trincomalee to Negombo (10 items)
      { name: "Even More Foods", start: 114, end: 123 },     // Lavariya to Batu Moju (10 items)
      { name: "Even More Brands", start: 124, end: 134 },    // Ritzbury to Diva (11 items)
      { name: "Even More Objects", start: 135, end: 141 },   // Miris Gala to Cane Basket (7 items)
      { name: "Even More Animals", start: 142, end: 148 },   // Blue Magpie to Palm Civet (7 items)
      { name: "Final Places", start: 149, end: 191 }         // Kataragama to Pettah (43 items)
    ];
    
    // Randomly select a subcategory
    const randomSubcategory = subcategories[Math.floor(Math.random() * subcategories.length)];
    
    // Get words only from that subcategory
    categoryData = categoryData.slice(randomSubcategory.start, randomSubcategory.end + 1);
    
    // Use a modified category key for shuffle bag tracking
    category = "The Boys - " + randomSubcategory.name;
  }

  // Initialize recently used words list for this category if needed
  if (!recentlyUsedWords[category]) {
    recentlyUsedWords[category] = [];
  }

  const recentList = recentlyUsedWords[category];
  const maxRecentSize = Math.max(3, Math.floor(categoryData.length * 0.6)); // Remember 60% of words
  
  // Get shuffle bag for this category
  const shuffleBag = getShuffleBag(category, categoryData.length);
  
  let selectedWord;
  let attempts = 0;
  const maxAttempts = 50; // Prevent infinite loops
  
  while (attempts < maxAttempts) {
    // Pop from shuffle bag
    const wordIndex = shuffleBag.pop();
    
    // If bag is empty, refill it
    if (wordIndex === undefined) {
      shuffleBags[category] = shuffleArray(
        Array.from({ length: categoryData.length }, (_, i) => i)
      );
      continue;
    }
    
    const candidate = categoryData[wordIndex];
    
    // Check if this word was used recently
    if (!recentList.includes(candidate.word)) {
      selectedWord = candidate;
      
      // Add to recent words list
      recentList.push(candidate.word);
      
      // Keep recent list size limited
      if (recentList.length > maxRecentSize) {
        recentList.shift(); // Remove oldest
      }
      
      break;
    }
    
    attempts++;
  }
  
  // Fallback: if we couldn't find a non-recent word (very small category)
  if (!selectedWord) {
    // Clear recent list and pick randomly
    recentlyUsedWords[category] = [];
    const randomIndex = Math.floor(Math.random() * categoryData.length);
    selectedWord = categoryData[randomIndex];
  }
  
  // Pick a random clue from the word's clueWords array
  const randomClueIndex = Math.floor(Math.random() * selectedWord.clueWords.length);
  const randomClue = selectedWord.clueWords[randomClueIndex];
  
  return {
    word: selectedWord.word,
    associationWord: randomClue
  };
};
`;

const outputPath = path.resolve(__dirname, '../data/gameContent.ts');
fs.writeFileSync(outputPath, fileContent);

console.log(`Game content generated at ${outputPath}`);
